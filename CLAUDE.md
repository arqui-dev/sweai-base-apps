# CLAUDE.md

Project rules for AI agents working in this repository. Workspace-wide
conventions live in `../ai-software-engineering/`: `guidelines/typescript.md`
for code, `guidelines/writing-style.md` for prose, and
`prompts/adrs/madr-template.md` for ADRs. This file holds only what is specific
to Hire Service.

## Plugin activation

```
/ponytail full
```

## Project context

Hire Service is a study base, not a product. It is a Next.js 16 application on
Vercel wired to Supabase (auth and Postgres), Stripe (one-off payments), Sanity
(content, with the Studio hosted by Sanity), and Resend (email), documented
with arc42 and Mermaid C4 diagrams in `docs/arc42/`. The demonstration product is a consulting landing page with a
blog, a coffee-sized paywall, a newsletter, and two lead lists.

It owns: the web application, its route handlers, the database schema in
`supabase/schema.sql`, the content schema in `sanity/schema/`, and all five
themes. The Studio is built from `sanity.config.ts` and published separately
with `npx sanity deploy`; it is not a route on this domain.

It does not own: identity, payment processing, content storage, or mail
delivery. Those are managed services, and the correct fix for a problem in one
of them is configuration, not code here.

## Blast-radius layers

Ordered highest risk first. Ask before changing anything in layers 1 to 3.

1. `supabase/schema.sql` plus `src/features/payments/**` and
   `src/features/posts/**`. Money and access. A mistake here either gives away
   paid content or charges the wrong amount. Run the `paywall-guardian` and
   `rls-reviewer` agents on any change.
2. `src/env.ts`, `src/env.public.ts`, `src/lib/supabase/admin.ts`,
   `next.config.ts`. Secrets and headers. A `NEXT_PUBLIC_` prefix in the wrong
   place publishes a key to every browser.
3. `src/proxy.ts`, `src/app/auth/**`. Sessions and redirects. A broken
   matcher signs everyone out; a loose `next` parameter is an open redirect.
4. `src/app/api/**`, `src/features/newsletter/**`, `src/features/leads/**`.
   Public write endpoints. Validation and rate limiting live here.
5. `src/app/(site)/**`, `src/components/**`, `src/app/themes.css`. Presentation.
   Change freely; `npm run verify` catches the rest.

## Placeholder convention

- `REPLACE` in `.env.example` means the operator fills it in. Not an error.
- `placeholder-*`, `sk_test_placeholder`, `whsec_placeholder`,
  `re_placeholder` and `https://placeholder.supabase.co` in `.env.local` and in
  `.github/workflows/ci.yml` are intentional. They exist so `npm run build`
  never needs real credentials. Do not replace them with real values, and do not
  flag them.
- `hello@example.com` is the placeholder sender.

These values are allowlisted in `.gitleaks.toml` by value, never by path, so a
real credential committed to the same file still fails the scan. Adding a new
placeholder means adding it there and here, in the same commit.

`src/shared/config-check.ts` detects them at request time and names them in the
`hint` field of a 503, outside production only. Add a new credential to its
`configured` map or a setup mistake in it will surface as a bare provider error
instead.

## Forbidden patterns

- `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `RESEND_API_KEY` and `ADMIN_API_TOKEN` must never appear in a `NEXT_PUBLIC_`
  variable, a client component, or a log line.
- No `process.env` outside `src/env.ts`, `src/env.public.ts`,
  `src/proxy.ts` and the Sanity config files. Everything else imports the
  validated object.
- No `supabaseAdmin` in a page, a component, or a route handler that has not
  already verified its caller. Today there are two legitimate call sites.
- No `any`, and no `!` non-null assertion on data from Supabase, Sanity, Stripe
  or a request body.
- No premium `body` passed to a client component. The GROQ query resolves it
  only for an entitled reader, and that is the only gate.
- No price, amount or currency read from a request. Those come from
  `src/env.ts`.
- No `request.json()` in the Stripe webhook. Signature verification needs the
  raw bytes.
- No new table for a new capture list. `public.leads` takes a list name.
- No per-theme branch in a component. A theme is CSS custom properties.
- No silent `catch`. Every one returns `err(...)`, logs, or rethrows. A page that
  degrades on a failed query still logs the reason: four silent catches once
  made a misconfigured Sanity project invisible.
- No credential-shaped literals in test fixtures. A test that needs a value
  which does *not* look like a placeholder assembles it at runtime, as
  `src/shared/config-check.test.ts` does. Never paste a real credential into a
  test, not even a truncated one.
- No `next-sanity`, and no `sanity` or `@sanity/vision` in `dependencies`. They
  drag the Sanity CLI into the production tree, which is 21 audit findings and
  the reason the Studio is hosted ([ADR-006](docs/adr/ADR-006-hosted-sanity-studio.md)).
  Content is read with `@sanity/client`.
- No commented-out code. Delete it; git remembers.

## Verification

`npm run verify` runs typecheck, lint and tests. `npm run build` is the fourth
gate and CI runs all four. Claiming work is done without running them is a
process violation, not an optimism problem.

```bash
npm run verify
npm run build
npm run scan:secrets   # needs the gitleaks binary; CI is the enforcing gate
```

`scan:secrets` reads `.gitleaks.toml` and `.gitleaksignore`. Run it before
pushing anything that adds a key-shaped string. CI runs it over full history
regardless, so skipping it locally only moves the failure later.

## Project agents

Defined in `.claude/agents/`. Invoke by description; there are no slash
commands in this repo.

| Agent | Use when |
|-------|----------|
| `paywall-guardian` | Any change under `src/features/posts`, `src/features/payments`, or a component receiving a `Post` |
| `rls-reviewer` | Any change to `supabase/schema.sql`, or a new table or query |
| `theme-smith` | Adding or editing a theme |
| `capture-page-builder` | A new waitlist, lead list, or signup page |
| `arc42-keeper` | After any change that alters the architecture the docs describe |
| `release-checker` | Before a production deploy |

## MCP servers in use

None required. The repository is self-contained.
