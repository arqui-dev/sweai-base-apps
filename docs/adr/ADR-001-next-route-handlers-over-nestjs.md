# ADR-001: Next.js route handlers instead of a separate NestJS service

**Date:** 2026-11-02
**Status:** Accepted
**Related ADRs:** [ADR-002](ADR-002-rls-as-the-authorization-layer.md) depends on this, because keeping one process is what makes row level security sufficient.

---

## Context

The brief named "LTS Next and or Nest JS" as the backend. The application needs
six server-side operations: subscribe to a newsletter, capture a lead, create a
Stripe Checkout session, handle a Stripe webhook, send a campaign, and exchange
a magic-link code. Every one of them is a short request that calls one or two
managed services and writes a row. The deploy target is Vercel, which runs
serverless functions with no long-lived process.

## Decision drivers

- Six handlers, none of them long-running, none of them stateful.
- One engineer, part time. Two services means two deploys, two env files, and a
  CORS surface between them.
- Vercel gives no process to host a NestJS server; it would need a container,
  which means a second platform.
- The Stripe webhook needs the raw request body, which both frameworks support.
- Server Components already read Supabase directly, so a separate API would be a
  second way to do the same thing.

## Options considered

### Option A: Next.js route handlers (chosen)

All server code lives in `src/app/api/**`, with business rules in
`src/features/**`.

**Pros:** One deploy, one `package.json`, one env file, no network hop between
the UI and its own backend. Type-safe calls from Server Components straight into
`features/`.
**Cons:** No dependency injection container, no decorator-based validation, and
no obvious seam if a mobile client ever needs the same API.

### Option B: NestJS on a container platform

Nest application on Fly, Railway or a Vercel Service, with Next as a pure
frontend.

**Pros:** Dependency injection, interceptors and a module graph that scale to a
large team. A clean API contract for future non-web clients.
**Cons:** Second deploy target, second set of secrets, CORS and session
forwarding between two origins, and roughly 600 lines of bootstrap for six
endpoints.

### Option C: NestJS compiled into a single Vercel function

Nest served through a serverless adapter inside the same project.

**Pros:** One deploy, keeps Nest's structure.
**Cons:** Cold starts grow with the Nest bootstrap, two routers in one project,
and the adapter is the part that breaks on framework upgrades.

## Comparison

| Criterion | A: route handlers | B: separate Nest | C: Nest in a function |
|-----------|-------------------|------------------|----------------------|
| Deploy targets | 1 | 2 | 1 |
| Lines of framework setup | ~0 | ~600 | ~250 |
| Cold start added | none | n/a, always warm | Nest bootstrap per cold start |
| Cost of a seventh endpoint | one file | one file plus a module | one file plus a module |
| Fit for a mobile client later | poor | good | fair |
| Operable by one part-time engineer | yes | no | fair |

## Recommendation

Route handlers. The backend is six short request-response operations, and
NestJS's value shows up in the problems this application does not have: many
teams touching one codebase, deep dependency graphs, and long-lived workers.

NestJS becomes correct when a second client needs the same API, or when
background work outlives a request. At that point the extraction is mechanical,
because the rules already live in `src/features/**` and not in the handlers.

## Consequences

- `src/app/api/**` holds HTTP concerns only: rate limiting, Zod parsing, status
  codes.
- `src/features/**` holds the rules, returns `Result<T, E>`, and knows nothing
  about HTTP. This is what keeps the NestJS escape hatch cheap.
- No dependency injection. Services import their clients from `src/lib/**`
  directly, and tests exercise pure functions instead of mocking a container.
- One `.env` surface, one Vercel project, no CORS configuration.

## Sources

- https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- https://docs.nestjs.com/faq/serverless
- https://vercel.com/docs/functions/runtimes/node-js
