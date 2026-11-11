# Product brief: the base

The base is the product. Writing this down matters because the demo
application on top of it looks like the product and is not.

**Date:** 2026-11-11

## What it is

A working Next.js application wired to Supabase, Stripe, a headless CMS and a
transactional email API, documented with arc42 and eight decision records, with
agent definitions and CI gates that encode how the project works.

Products get started by copying it.

## Who it serves

| Who | What they need from it | Served by |
|-----|------------------------|-----------|
| andrevst, starting a product | The plumbing already done and the decisions already made, so the first week goes into the product and not into auth and payments | The stack, the 8 ADRs, the CI gates |
| An agent working in a copy | Enough written context to make the hundred small calls the way andrevst would | CLAUDE.md, the agent definitions, the invariant tables |
| A contributor arriving later | To change something without reverse-engineering four integrations | arc42, the dependency register, the use cases with their designed failures |

The Hire Service demo serves none of these directly. It exists to exercise
every integration at least once, which is the only reason it has a blog, a
paywall, a newsletter and two lead lists.

## Success

| Measure | Today | Target | Where it is read |
|---------|-------|--------|------------------|
| Days from copy to first product-specific commit | Not measured | 1 | Timestamp of the first commit that is not configuration |
| Decisions a new product has to re-make | 0 of 8 re-made so far, 0 products started | 0 | ADRs re-litigated in the second product |
| Runtime vulnerabilities | 0 | 0 | `npm run audit:runtime` in CI |
| Agent definitions actually exercised | 0 of 8 | 8 of 8 | Agent runs that produced a finding or a pass |

The fourth row is the honest one. Eight agent definitions exist and none has
been executed through the agent registry, because they were written in a
session that had already loaded its registry. Until that number moves, the
agent layer is a design and not a capability.

## Non-goals

- Becoming the arqui.dev company site. That is a separate repository and a
  separate Vercel project.
- Being a framework. There is no package to install and no API to keep stable.
  Copy it and edit it.
- Supporting every product shape. It covers content, identity, one-off payment
  and email. A product needing realtime, multi-tenancy or a mobile client
  starts here and diverges, which is expected.

## Anti-goals

- **A base nobody can change.** Abstraction added for a second product that
  does not exist yet is the failure mode. If the second product has to fight
  the base, the base lost.
- **Documentation that describes a system that no longer exists.** Worse than
  no documentation, because people act on it.
- **Gates that get switched off.** A check that fires on things nobody will fix
  trains everyone to skip the whole suite.

## Constraints

Fixed before design started, recorded in
[arc42 section 2](../arc42/02-constraints.md). Vercel, Node LTS, Next.js App
Router, TypeScript strict, Tailwind, and the four paid services. Changing one
is a new ADR with the migration cost stated.

## Kill condition

The base is replaced, not patched, when two products started from it both had
to fight the same decision. That is evidence the decision was wrong rather
than the products being unusual.
