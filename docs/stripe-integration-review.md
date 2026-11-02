# Stripe integration review

**Date:** 2026-11-02
**Business:** arqui.dev, IT consultancy
**Stripe products needed:** Payments, Invoicing
**Reviewed against:** Stripe's documented practice for one-off Checkout
payments and webhook handling.

> This review was written **without** output from `stripe_implementation_planner`.
> The Stripe plugin is installed, but its MCP server at `https://mcp.stripe.com`
> needs an interactive OAuth that cannot run inside a tool call. Reconcile this
> document with the generated plan before acting on it; where the two disagree,
> the generated plan describes your actual account configuration and wins.

---

## What exists today

One-off payment for premium content, built on hosted Checkout.

| Piece | File |
|-------|------|
| Session creation | `src/features/payments/checkout.service.ts` |
| Input validation | `src/features/payments/payments.schema.ts` |
| Webhook handling | `src/features/payments/webhook.service.ts` |
| Access grant | `src/features/payments/entitlements.service.ts` |
| Client pinning | `src/lib/stripe.ts`, API version `2026-10-28.endive` |

## What it already gets right

| Practice | Where |
|----------|-------|
| No card data touches the application | Hosted Checkout, redirect only |
| Amount is server-decided, never read from the request | `COFFEE.unitAmount` from `src/env.ts`; `payments.schema.test.ts` proves a client-sent price is stripped |
| Signature verified before any field is read | `constructEvent` on the raw body, before parsing |
| Raw body preserved for verification | `request.text()`, never `request.json()` |
| Idempotent grant | `unique (stripe_event_id)` plus `ignoreDuplicates` |
| Correct retry semantics | 400 on a bad signature stops retries, 500 on a failed write invites them |
| API version pinned | A Stripe-side bump cannot change payload shapes without a commit |
| Quantity bounded | Zod caps it at 20, so a tampered request cannot mint a 10,000 unit session |

## Findings

Ordered by what it costs to leave alone.

### F1. A refunded payment keeps its access, forever

**Severity: high. This one loses money.**

`webhook.service.ts` handles `checkout.session.completed` and ignores every
other event. Nothing listens for `charge.refunded` or
`charge.dispute.created`, and nothing ever deletes an entitlement row. A buyer
can pay, read every premium post, refund through their bank, and keep access
permanently.

Fix: handle `charge.refunded` and `charge.dispute.created`, and revoke the
entitlement for that payment. That needs the row to be traceable back to the
charge, so `grantPremium` should also store `stripe_payment_intent_id`.

### F2. Delayed payment methods grant access before the money arrives

**Severity: high for Brazil specifically.**

The handler grants on `checkout.session.completed` with
`payment_status === "paid"`. For a card that is correct. For any delayed
notification method, Boleto and Pix included, the session completes with
`payment_status === "unpaid"` and settles minutes or days later via
`checkout.session.async_payment_succeeded`. Today those buyers are silently
refused, and the current code never grants them access even after they pay.

Fix: handle `checkout.session.async_payment_succeeded` with the same grant path
and `checkout.session.async_payment_failed` for the failure case. This matters
before enabling any Brazilian payment method, which an IT consultancy billing
locally will want.

### F3. Currency and tax are wrong for a Brazilian consultancy

**Severity: medium. Blocks real invoicing.**

`COFFEE_CURRENCY` defaults to `usd` and `automatic_tax` is not enabled.
Consulting services sold in Brazil are invoiced in BRL and carry tax treatment
that Stripe will not apply unless asked.

Fix: set `COFFEE_CURRENCY=brl` for the real deployment, and decide explicitly
whether `automatic_tax: { enabled: true }` belongs on the session. That is a
tax question, not a code question, so it needs an answer before the first real
charge.

### F4. No idempotency key on session creation

**Severity: medium.**

`sessions.create` is called without an `idempotencyKey`. A double-clicked
button or a retried request creates two Checkout sessions. The grant stays
idempotent, so nobody is double-charged by the application, but the buyer can
reach two live payment pages and pay twice.

Fix: pass an `idempotencyKey` derived from the buyer and the cart contents.

### F5. Every purchase creates a detached payment

**Severity: medium. Blocks Invoicing.**

The session passes `customer_email` and no `customer`. Stripe therefore records
guest payments with no Customer object, so the dashboard shows no purchase
history per client, and an invoice cannot be raised against a buyer later.
Invoicing is built on Customers.

Fix: create or look up a Stripe Customer keyed by email, store its id
alongside the entitlement, and pass `customer` on the session. This is the
prerequisite for everything in the Invoicing section below.

### F6. No `client_reference_id`

**Severity: low.**

Reconciling a Stripe payment to a Supabase user means reading
`metadata.user_id`. `client_reference_id` is the field Stripe's own dashboard
search and reporting are built around.

Fix: set `client_reference_id` to the Supabase user id when there is one.

### F7. Abandoned sessions are invisible

**Severity: low.**

Nothing handles `checkout.session.expired`, so an abandoned checkout leaves no
trace. For a $5 coffee that is fine. For a consulting invoice it is a lost
lead that nobody follows up.

### F8. Webhook retries are not observable

**Severity: low.**

A failed grant returns 500 and Stripe retries for up to three days. The only
record is a log line. There is no counter and no alert, so a sustained failure
looks like silence.

---

## Invoicing: not built

Payments is implemented. Invoicing is not, and it is the half an IT consultancy
actually bills with. The current product sells one $5 item to an anonymous
reader. An engagement is a different shape:

| Dimension | Coffee (built) | Engagement (not built) |
|-----------|----------------|------------------------|
| Amount | Fixed, server config | Negotiated per client |
| Payer | Anonymous reader | A company with a tax id |
| Trigger | Buyer clicks | Owner raises an invoice |
| Settlement | Immediate card | Net 15 or 30, bank transfer or Boleto |
| Artifact | A receipt | A numbered invoice, legally required |
| Stripe object | Checkout Session | Customer plus Invoice plus Invoice Items |

The repository already has the lead that becomes an engagement: a row in
`public.leads` from `/early-access` or `/waitlist`, carrying email, company and
a free-text `note`.

What building it needs, in order:

1. **A decision on where invoices are raised.** Stripe Dashboard by hand, or an
   admin route in this application. The dashboard needs no code and is the
   right answer for the first ten clients.
2. **Customers.** Finding F5. Without Customer objects there is nothing to
   invoice.
3. **A `clients` or `engagements` table**, if invoices are raised from the
   application. Scope, rate, currency, and the Stripe customer and invoice ids.
4. **Webhook events**: `invoice.paid`, `invoice.payment_failed`,
   `invoice.finalized`, `invoice.marked_uncollectible`.
5. **Tax configuration**, which is finding F3 and is a question for an
   accountant, not a developer.

Items 1 and 5 are decisions only arqui.dev can make, and they change what gets
built. That is why no Invoicing code is in this commit.

---

## Suggested order

| Step | Finding | Blocked on |
|------|---------|------------|
| 1 | F1 refunds and disputes | Nothing. Build it next |
| 2 | F4 idempotency key | Nothing |
| 3 | F6 `client_reference_id` | Nothing |
| 4 | F5 Stripe Customers | Nothing, and it unblocks Invoicing |
| 5 | F2 async payment events | Needed before enabling Pix or Boleto |
| 6 | F3 currency and tax | An answer from arqui.dev |
| 7 | Invoicing | Decisions 1 and 5 above |
| 8 | F7, F8 | Lowest value, do them when the others are done |

Findings F1 through F6 are code changes inside
`src/features/payments/**` and `supabase/schema.sql`, and each one is small.
Nothing here requires touching the paywall, the themes, or the newsletter.
