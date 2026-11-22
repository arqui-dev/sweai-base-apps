# 02: Decide the paywall boundary for a public content dataset

**Status:** `ready`
**Agent:** `cloud-solutions-architect`
**Linear:** UNTRACKED
**Created:** 2026-11-21

A verified finding: the Sanity dataset is readable without a token. An anonymous
`GET https://<projectId>.apicdn.sanity.io/v2025-01-01/data/query/<dataset>?query=...`
returns HTTP 200, and `projectId` ships in the client bundle because it is a
`NEXT_PUBLIC_` variable. The dataset currently holds zero posts, so there is no
live exposure, and that changes with the first premium post.

ADR-005 enforces the paywall inside the GROQ query the application sends. That
controls the application's own query and nothing else.

Decide and draft an ADR covering:

1. Whether ADR-005 is wrong, incomplete, or correct with an undocumented
   constraint.
2. The options for closing it, with what each costs: a private dataset plus a
   server-side read token, a separate dataset for premium bodies, moving premium
   bodies out of the CMS, or accepting it with a stated limit.
3. What `docs/arc42/11-risks-and-technical-debt.md` should say. Its current row
   claims the mitigation is that premium bodies gate on `$entitled`, which is
   not true of a query an attacker writes.
4. Whether `SANITY_API_READ_TOKEN`, which `src/env.ts` declares and nothing
   reads, is part of the answer.

Draft the ADR in `docs/adr/`. Do not assign a number and do not approve it.

## Log

- **2026-11-21** Written. The finding came from the paywall-guardian run on
  2026-11-11 as an out-of-scope flag, and Claude confirmed the HTTP 200
  independently. It was left unfixed because the fix changes ADR-005.
