# ADR-005: Enforce the paywall in the GROQ query

**Date:** 2026-11-02
**Status:** Accepted
**Related ADRs:** [ADR-003](ADR-003-entitlements-keyed-by-email.md) decides who counts as entitled.

---

## Context

Premium post bodies are Portable Text in Sanity. The first quality goal is that
paid content stays paid. The common way to build this is to fetch the whole post
and render a teaser, which means the full premium text sits in the server
process and in any React payload that accidentally includes it. Next.js streams
Server Component props to the client, so a body held in a variable is one
careless prop away from the network.

## Decision drivers

- A paywall that leaks is worse than no paywall, because it was sold as access.
- The body must not be in the HTTP response for a reader without an entitlement.
- The rule has to be expressed once, so the page and the test cannot drift.
- Sanity's dataset is public-read, so the query itself must not be the only
  secret.

## Options considered

### Option A: Conditional field resolution in GROQ (chosen)

`"body": select(coalesce(isPremium, false) == false || $entitled == true => body, null)`.
Sanity returns `null` for a locked body, so the text never reaches Node.

**Pros:** The premium text is absent from the process, the React payload and the
response. `isLocked` holds the rule, `assertNoLeak` turns a regression into a
500 instead of a leak.
**Cons:** Part of the access rule lives in a query string, so a reviewer has to
read GROQ. Entitlement must be resolved before fetching, which costs one
Supabase round trip first.

### Option B: Fetch everything, truncate when rendering

Fetch the full post, render `body.slice(0, 2)` for locked readers.

**Pros:** One query, simple to read, and a real teaser from the actual content.
**Cons:** The full text is in the process. Any future component that receives
the post object can serialize it to the client. The leak would be silent.

### Option C: A separate authenticated endpoint for premium bodies

Page renders the shell, the client fetches the body from a route handler that
checks entitlement.

**Pros:** The check is plain TypeScript and easy to test.
**Cons:** Premium content renders client-side, so it is invisible to search
engines and to readers with JavaScript off, and it adds a loading state to the
thing people paid for.

## Comparison

| Criterion | A: GROQ condition | B: truncate on render | C: separate endpoint |
|-----------|-------------------|-----------------------|----------------------|
| Locked body present in the Node process | no | yes | no |
| Leak visible if a component passes the post to the client | cannot happen | silent leak | cannot happen |
| Queries per page view | 1 Supabase plus 1 Sanity | 1 Sanity | 1 Supabase plus 2 fetches |
| Premium content server-rendered | yes | yes | no |
| Where the rule is written | `posts.gate.ts` plus the query | render code | route handler |

## Recommendation

Conditional resolution in GROQ. The deciding criterion is the failure mode:
option B leaks silently the first time someone passes a post object to a client
component, and that is a change no reviewer would flag. Option A makes the leak
structurally impossible, and the extra Supabase round trip is already paid for
by the navigation bar reading the user.

Option C becomes correct if premium content ever needs to be requested
incrementally, such as a long document loaded in sections.

## Consequences

- `getPost(slug, hasPremium)` takes entitlement as an argument, so callers
  cannot forget it. `hasPremium()` runs first, in parallel with the user read.
- `isLocked` in `src/features/posts/posts.gate.ts` is the only expression of the
  read rule. The page and `posts.gate.test.ts` both call it.
- `assertNoLeak` runs on every post render. It throws if a locked post carries a
  body, converting a future regression into a 500 rather than a leak.
- `Post.body` is typed `readonly PortableTextBlock[] | null`, so TypeScript
  forces every caller to handle the locked case.
- The excerpt is the teaser. Editors write it in Studio, and it is a required
  field for that reason.

## Sources

- https://www.sanity.io/docs/groq-operators#select-caa2a2e9e0a7
- https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns
