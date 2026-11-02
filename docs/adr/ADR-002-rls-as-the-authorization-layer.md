# ADR-002: Supabase row level security as the authorization layer

**Date:** 2026-11-02
**Status:** Accepted
**Related ADRs:** [ADR-001](ADR-001-next-route-handlers-over-nestjs.md) made this viable; [ADR-003](ADR-003-entitlements-keyed-by-email.md) relies on the policy matching two columns.

---

## Context

Four tables hold data with different visibility: `profiles` and
`entitlements` are per-user, `newsletter_subscribers` is per-address, and
`leads` should not be readable through the API at all. Server Components query
Supabase directly, so authorization cannot live only in route handlers. The
publishable key reaches the browser by design, which means anything the `anon`
role can read is public.

## Decision drivers

- The publishable key is public. Table access has to be denied by default.
- Server Components read Supabase directly, so there is no single choke point in
  application code to guard.
- A forgotten `if` in one of twelve pages must not expose another user's rows.
- The service-role key bypasses everything, so its call sites must be countable.

## Options considered

### Option A: RLS policies as the authorization layer (chosen)

Every table has `enable row level security` and explicit `select`/`update`
policies. Application code renders; Postgres decides which rows exist.

**Pros:** Default deny. A missing check in a page shows an empty list instead of
someone else's data. The rules are readable in one file.
**Cons:** Policies are SQL, tested against a real database rather than in unit
tests, and a bad policy fails closed in a way that looks like an application
bug.

### Option B: Service-role client everywhere, filters in application code

Every query runs with the service-role key and adds `.eq("user_id", user.id)`.

**Pros:** Familiar, all logic in TypeScript, easy to unit test with mocks.
**Cons:** One forgotten filter exposes the whole table. The service-role key
would appear in every data path, so a single SSRF or log leak is total.

### Option C: Route handlers as the only data path

Server Components call internal API routes, which hold all authorization.

**Pros:** One choke point.
**Cons:** A network hop to our own process on every render, and it throws away
the main reason to use Server Components. Still needs RLS as a backstop.

## Comparison

| Criterion | A: RLS | B: service role plus filters | C: API-only data path |
|-----------|--------|------------------------------|----------------------|
| Behavior when a check is forgotten | no rows returned | full table exposed | depends on the handler |
| Service-role key call sites | 2 | every query | every query |
| Where the rule is readable | `supabase/schema.sql` | spread across pages | spread across handlers |
| Unit testable in TypeScript | no | yes | yes |
| Extra latency per render | none | none | one internal round trip |

## Recommendation

RLS. The deciding criterion is the failure mode: with policies, forgetting a
check returns nothing, and with application filters, forgetting a check returns
everything. For a codebase one person maintains part time, failing closed is
worth losing the convenience of TypeScript-only tests.

Application filters become correct if the data model grows rules that policies
express badly, such as access that depends on a third service. At that point the
right move is a Postgres function called from a policy, not abandoning RLS.

## Consequences

- `supabase/schema.sql` is part of the security surface and gets reviewed as
  such. It enables RLS on all four tables and writes five policies.
- `leads` has no policy at all, on purpose: service-role writes, dashboard
  reads. A page that needs to show leads must add a policy in the same commit.
- The service-role client exists in `src/lib/supabase/admin.ts` and is imported
  by exactly two paths: the signature-verified Stripe webhook and the
  token-verified campaign sender.
- `hasPremium()` queries under the user's session, so it cannot see another
  user's entitlement even if called with the wrong argument.

## Sources

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://www.postgresql.org/docs/current/ddl-rowsecurity.html
