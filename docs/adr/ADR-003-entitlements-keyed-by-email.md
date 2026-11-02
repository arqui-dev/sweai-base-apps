# ADR-003: Entitlements keyed by email with an optional user id

**Date:** 2026-11-02
**Status:** Accepted
**Related ADRs:** [ADR-002](ADR-002-rls-as-the-authorization-layer.md) carries the policy that makes both keys work.

---

## Context

A visitor can buy a coffee without an account: the coffee button accepts an
email for the receipt and sends them to Stripe Checkout. Signing in uses a magic
link, which means account creation happens after the payment in that flow. The
webhook that grants access therefore often has an email and no user id, and the
grant has to survive until the buyer signs up, possibly days later.

## Decision drivers

- Requiring an account before paying adds a step to the only flow that earns
  money.
- Stripe's webhook arrives with whatever was in session metadata plus the
  receipt email. It has no Supabase user id unless we put one there.
- Access must survive guest purchase followed by later signup, with no manual
  reconciliation.
- A replayed webhook must not grant twice.

## Options considered

### Option A: Email as the subject, `user_id` optional (chosen)

`entitlements` carries `email` (not null) and `user_id` (nullable). The read
policy is `auth.uid() = user_id or auth.email() = email`.

**Pros:** Guest purchase works with no follow-up job. The webhook writes what it
actually has. One row covers both cases.
**Cons:** Email is the identity, so a user who changes their Supabase email
loses the match until a row is updated.

### Option B: Require sign-in before checkout

The coffee button redirects anonymous visitors to `/login` first.

**Pros:** `user_id` is always present, the policy is one column, and email
changes are irrelevant.
**Cons:** Inserts a magic-link round trip into the purchase, and the buyer has
to leave the browser for their inbox mid-checkout.

### Option C: Grant by email, then backfill `user_id` with a signup trigger

Same write path as A, plus a trigger on `auth.users` that claims matching rows.

**Pros:** Clean joins by id afterwards.
**Cons:** A trigger to maintain and test for an outcome the email policy already
delivers. It solves reporting, not access.

## Comparison

| Criterion | A: email plus optional id | B: require sign-in | C: email plus backfill trigger |
|-----------|---------------------------|--------------------|-------------------------------|
| Steps before paying | 1 | 2 | 1 |
| Guest purchase supported | yes | no | yes |
| Moving parts | 1 table | 1 table | 1 table plus 1 trigger |
| Survives an email change | no | yes | partly |
| Joinable to `profiles` by id | only for signed-in buyers | yes | yes |

## Recommendation

Email as the subject with an optional user id. The purchase is a single
low-value payment, and the conversion cost of a forced sign-in is the largest
factor. The email-change weakness is acceptable because changing the email on a
magic-link account is itself rare, and the repair is a one-row update.

Option B becomes correct if entitlements ever carry real value, such as a
recurring plan, where identity needs to be stable rather than convenient.

## Consequences

- `public.entitlements` has `email text not null`, `user_id uuid null`, and
  `unique (stripe_event_id)`.
- Uniqueness on `stripe_event_id` plus `ignoreDuplicates` makes a replayed
  Stripe event a no-op, which is what lets the webhook return 500 and be retried
  safely.
- `grantPremium` writes `user_id` when the Checkout metadata has one and `null`
  otherwise.
- No signup trigger. Section 11 records this as a deliberate shortcut, with
  reporting as the trigger to add one.
- `/success` tells guest buyers to sign in with the purchase email, because that
  is the step that connects the grant to a session.

## Sources

- https://docs.stripe.com/payments/checkout/custom-success-page
- https://supabase.com/docs/guides/database/postgres/row-level-security#helper-functions
