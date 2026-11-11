# Product roadmap

Ordered by what unblocks the most, not by appeal. No dates: nothing here has an
external deadline, so a sequence is honest and a date would be a guess that
gets quoted back.

Items leave this file when they ship or die. The AI tooling backlog lives
separately in [docs/ai-roadmap.md](../ai-roadmap.md); this file is the product.

**Status: 2026-11-11.** Four items block everything downstream and all four
need andrevst. Nothing in tier 1 can be verified until the first two land.

## Tier 0: unblocks the rest

| # | Item | Blocked on | Unblocks |
|---|------|-----------|----------|
| 0.1 | Apply `supabase/schema.sql` to the project | andrevst, one paste into the SQL editor. The file is idempotent | Every write path. UC-05, UC-06, UC-07, UC-08 and UC-13 are untestable without it |
| 0.2 | Set `SUPABASE_SECRET_KEY` | andrevst, Project settings then API keys | The webhook grant, the lead capture, the newsletter store. Writes answer 503 without it even with 0.1 done |
| 0.3 | Register the 8 agent definitions | andrevst, restart the session. The definitions were written after this session loaded its registry | The entire agent layer, which is the project's stated goal. Today 0 of 8 have run |
| 0.4 | Set the Stripe keys and the webhook endpoint | andrevst, dashboard | All of tier 1. Also `stripe_implementation_planner`, which needs the MCP authenticated |

Item 0.3 is the one most worth noticing. Eight agent definitions, eight
invariant tables and a roadmap for four more exist, and none has been executed
through the registry. The capability is unproven, not absent.

## Tier 1: revenue correctness

Each is a finding from [the Stripe review](../stripe-integration-review.md).
All need 0.4.

| # | Item | Why it ranks here |
|---|------|-------------------|
| 1.1 | [PRD-001](PRD-001-revoke-access-on-refund.md), revoke access on refund or dispute | The only open item that loses money rather than costing opportunity, and the loss is unbounded |
| 1.2 | Handle delayed payment methods, review finding F2 | Pix and Boleto complete the session as unpaid and settle later. Today those buyers pay and get nothing. Blocks selling in Brazil at all |
| 1.3 | Idempotency key on session creation, F4 | A double-clicked button reaches two live payment pages |
| 1.4 | `client_reference_id`, F6 | Reconciliation in the Stripe dashboard, which is where a refund gets investigated |

## Tier 2: Invoicing

The half an IT consultancy actually bills with. Two of its prerequisites are
decisions, not code.

| # | Item | Blocked on |
|---|------|-----------|
| 2.1 | Decide where invoices are raised: Stripe dashboard, or an admin route here | andrevst. The dashboard needs no code and is right for the first ten clients |
| 2.2 | Decide whether `automatic_tax` applies to consulting services billed in Brazil | andrevst, with an accountant. It changes every session and invoice created |
| 2.3 | Create Stripe Customer objects, F5 | Nothing. Invoicing is built on Customers, so this is the one buildable prerequisite |
| 2.4 | Invoicing itself | 2.1, 2.2, 2.3 |

## Tier 3: the base as a product

Work that makes the base better at being copied, which is its actual job.

| # | Item | Blocked on |
|---|------|-----------|
| 3.1 | Publish the Studio and create the first post | andrevst runs `npx sanity deploy`, then sets `NEXT_PUBLIC_SANITY_STUDIO_URL`. The blog renders "No posts yet" today, correctly |
| 3.2 | Row level security tests against a real Postgres | A database in CI. Authorization is the one layer with no automated test |
| 3.3 | Decide whether to adopt `supabase/migrations/` | andrevst. Converting costs 20 doc references; the gain is ordered migration history, which a base probably wants |
| 3.4 | Drive the build-time audit to zero | Upstream. Would collapse the two-scope policy in ADR-007 into one strict gate |
| 3.5 | Build the four remaining agents | 0.3 first. Building more unexercised definitions before proving one would repeat the mistake |

## Next three actions

In order. The first two are andrevst's and take minutes; the third is Claude's
and is the only tier 1 item that can start without new credentials.

1. **Apply the schema** (0.1). The SQL is idempotent and was copied to the
   clipboard. One paste. Everything in tier 1 and most of the use cases are
   untestable until this lands.
2. **Restart the session** (0.3) so the agent definitions register. Without it
   the project's central claim stays unproven, and this review had to run the
   definitions through general-purpose agents instead.
3. **Write the ADR for PRD-001** and build it against Stripe test keys. The PRD
   is ready and makes no architecture decision, which is exactly the handoff
   the seam in [the product README](README.md) describes.

## Not on the roadmap

Recorded so it does not get re-proposed: recurring subscriptions, refunds
initiated in-app, invoicing in multiple currencies, team accounts, comments,
search, and internationalization. Each would be a new PRD and a new ADR, not a
patch.
