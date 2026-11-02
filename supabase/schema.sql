-- Hire Service schema. Apply with the Supabase SQL editor or `supabase db push`.
-- Every table has row level security on with no permissive default, so a leaked
-- anon key grants nothing beyond what a policy below explicitly allows.

-- ---------------------------------------------------------------------------
-- profiles: the app's own row per auth user
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Keeps profiles in step with auth.users without the app owning signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- newsletter_subscribers: written by the service role, read by the owner
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  email            text primary key,
  name             text,
  source           text not null default 'subscribe',
  created_at       timestamptz not null default now(),
  unsubscribed_at  timestamptz
);

alter table public.newsletter_subscribers enable row level security;

-- The profile page shows subscription status, so a signed-in user may read the
-- single row that carries their own address. Writes stay with the service role.
create policy "subscribers: read own" on public.newsletter_subscribers
  for select using (auth.email() = email);

create index if not exists newsletter_active_idx
  on public.newsletter_subscribers (created_at)
  where unsubscribed_at is null;

-- ---------------------------------------------------------------------------
-- leads: waitlist and early access, one row per (email, list)
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  list        text not null check (list in ('waitlist', 'early-access')),
  name        text,
  company     text,
  note        text,
  created_at  timestamptz not null default now(),
  unique (email, list)
);

alter table public.leads enable row level security;
-- No policy on purpose: leads are write-only from the service role and are read
-- in the Supabase dashboard. Add a policy the day a page needs to show them.

create index if not exists leads_list_idx on public.leads (list, created_at desc);

-- ---------------------------------------------------------------------------
-- entitlements: what a coffee bought
-- ---------------------------------------------------------------------------
create table if not exists public.entitlements (
  id               uuid primary key default gen_random_uuid(),
  email            text not null,
  user_id          uuid references auth.users (id) on delete set null,
  kind             text not null default 'premium' check (kind in ('premium')),
  -- Unique so a replayed Stripe webhook upserts instead of granting twice.
  stripe_event_id  text not null unique,
  amount_total     integer not null default 0,
  currency         text not null default 'usd',
  created_at       timestamptz not null default now()
);

alter table public.entitlements enable row level security;

-- Matching on email as well as user_id is what lets a guest who paid first and
-- signed up later keep their access.
create policy "entitlements: read own" on public.entitlements
  for select using (auth.uid() = user_id or auth.email() = email);

create index if not exists entitlements_email_idx on public.entitlements (email, kind);

-- ponytail: no backfill trigger setting user_id on signup. The email branch of
-- the read policy already covers guest-then-signup. Add the trigger only if a
-- report needs to join entitlements to profiles by id.
