# PRD-001: Revoking premium access when a payment comes back

**Date:** 2026-11-11
**Status:** Ready
**Blocked on:** nothing. Stripe test keys are enough to build and verify it.
**Related:** [the Stripe review, finding F1](../stripe-integration-review.md), [ADR-003](../adr/ADR-003-entitlements-keyed-by-email.md), [UC-03](../use-cases.md)

---

## Problem

A reader can pay for premium access, read every premium post, refund the
payment through their bank, and keep the access permanently. Nothing in the
system listens for a refund or a dispute, and no code path has ever removed an
entitlement.

The evidence is in the code, not in a hypothesis: the webhook handler returns
early on any event other than `checkout.session.completed`, and the
entitlements table has no delete or revoke path. Finding F1 of the Stripe
review traced it. The buyer in [UC-03](../use-cases.md) is the persona with
the problem, in the sense that they are the one who can exploit it.

The loss is unbounded rather than small. A single buyer can repeat it, and
nothing surfaces that it happened.

## Why now

Three reasons it moves ahead of the other Stripe work. It is the only open item
that loses money rather than costing opportunity. It is unblocked, where
Invoicing waits on two decisions only andrevst can make. And it has to exist
before the first real charge, because a refund arriving at a system with no
revocation path leaves no record to reconcile from later.

## Success

| Measure | Today | Target | Where it is read |
|---------|-------|--------|------------------|
| Refunded payments that retain access | 100 percent | 0 | Entitlements with no corresponding completed, unrefunded payment |
| Time from refund to access removed | Never | Under one minute | Gap between the Stripe event timestamp and the revocation record |
| Disputes that retain access | 100 percent | 0 | Same query, filtered to disputed payments |
| Revocations that reach a log line | n/a | 100 percent | The structured log, same shape as the grant |

The first measure needs a query that does not exist. Writing it is in the
acceptance criteria, because a target nobody can read is not a target.

## Non-goals

- Refunding from inside the application. Refunds happen in the Stripe
  dashboard, and that is fine.
- Partial refunds adjusting partial access. Access is binary.
- Notifying the reader that access ended. Stripe already mails them about the
  refund.
- Reinstating access if a dispute is later resolved in the seller's favor.
  Rare, and a manual grant covers it.

## Anti-goals

- **Revoking access from someone who did not get a refund.** A false
  revocation is worse than the current leak: it takes access from a paying
  reader and produces a support conversation with no record of why.
- **A revocation path that an unsigned request can trigger.** The grant path is
  signature-verified. An unverified revoke endpoint would be a denial of
  service against paying readers.
- **Silent revocation.** If access disappears and nothing logged it, nobody can
  answer the reader's question.

## Behavior

A reader who refunds their payment loses premium access within about a minute.
On their next request a premium post shows the paywall again, exactly as it did
before they paid. Free posts are unaffected.

A reader whose payment is disputed by their bank loses access on the same
terms.

A reader who paid and did not refund notices nothing.

Two product constraints, stated without choosing how to meet them:

1. A revocation must be traceable to the specific payment that granted the
   access. Revoking by email alone would remove access that a second,
   un-refunded payment had legitimately granted.
2. The revocation must be idempotent. Stripe retries events, and a retry must
   not produce a second revocation record or a different outcome.

How those are met is an architecture decision and belongs in an ADR, because
the current grant is keyed by email with an optional user id
([ADR-003](../adr/ADR-003-entitlements-keyed-by-email.md)) and that key does
not identify a payment.

## Acceptance criteria

| # | Criterion | How it is checked |
|---|-----------|-------------------|
| 1 | A refund event removes the matching entitlement | `stripe trigger charge.refunded` against a local forward, then the entitlement query returns no row |
| 2 | A dispute event removes the matching entitlement | `stripe trigger charge.dispute.created`, same query |
| 3 | A replayed refund event changes nothing and still answers 200 | Send the same event twice; one revocation record, both responses 200 |
| 4 | An unsigned revoke attempt is refused | `curl -X POST .../api/stripe/webhook -d '{"type":"charge.refunded"}'` returns 400 and no row changes |
| 5 | A second, un-refunded payment by the same reader keeps access | Two grants, refund one, access remains |
| 6 | Every revocation writes a log line carrying the Stripe event id | Read the structured log after criterion 1 |
| 7 | The paywall returns for a revoked reader without a deploy or a cache purge | Request a premium post after criterion 1 and assert the body is absent |
| 8 | The reconciliation query exists and returns zero | A documented query, run after the suite, that lists entitlements with no valid payment |
| 9 | `npm run verify` and `npm run audit:runtime` still pass | CI |

Criterion 7 is the one that catches a mistake the other eight miss: a
revocation that updates the database but leaves a cached page serving the
premium body.

## Kill condition

Remove this if the paywall itself is removed, or if payments move to a provider
that settles irreversibly. Neither is on the roadmap.

## Open questions

None that change what gets built. The traceability key is an architecture
question for the ADR, not a product question.
