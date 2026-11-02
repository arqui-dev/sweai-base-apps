# 10. Quality requirements

## Quality tree

```mermaid
flowchart LR
  Q[Quality] --> SEC[Security]
  Q --> REU[Reusability]
  Q --> PERF[Performance]
  Q --> OPS[Operability]
  Q --> A11Y[Accessibility]

  SEC --> S1[Paid content cannot leak]
  SEC --> S2[Secrets stay server-side]
  SEC --> S3[Payment amount is server-decided]
  SEC --> S4[Webhooks are signature-verified]

  REU --> R1[New capture page needs no migration]
  REU --> R2[New theme needs no component change]
  REU --> R3[New product starts from this repo]

  PERF --> P1[Blog list under 1s TTFB]
  PERF --> P2[Content cached 60s, not per request]

  OPS --> O1[Verify runs in under 3 minutes]
  OPS --> O2[Build never needs real credentials]
  OPS --> O3[Replayed webhook is a no-op]

  A11Y --> A1[Every input has a label]
  A11Y --> A2[Focus is visible in all five themes]
  A11Y --> A3[Reduced motion is respected]
```

## Scenarios

| # | Scenario | Response | Measured by |
|---|----------|----------|-------------|
| S1 | A reader without an entitlement requests a premium post | The body is not in the HTTP response, and not in the Node process | `posts.gate.test.ts`, plus `assertNoLeak` at runtime |
| S2 | A client posts `{"quantity":2,"unitAmount":1}` | Charged two coffees at the server price; `unitAmount` is stripped | `payments.schema.test.ts` |
| S3 | Stripe replays `checkout.session.completed` | One entitlement row, 200 response | `unique (stripe_event_id)` plus `ignoreDuplicates` |
| S4 | A forged webhook arrives with no signature | 400, nothing written | `handleStripeWebhook` returns `BAD_SIGNATURE` before reading the body |
| S5 | Resend is down when someone subscribes | 200, address stored, failure logged | `subscribe()` catches and logs the send |
| S6 | A sixth theme is needed | One CSS block and one array entry, no component diff | `themes.css` plus `THEMES` |
| S7 | A third capture list is needed | One enum value, no migration | `LEAD_LISTS` plus the `check` constraint |
| S8 | A contributor runs `npm run verify` on a clean clone | Typecheck, lint and tests pass with placeholder env | CI job `verify` |
| S9 | A secret is committed | The pipeline fails before merge | CI job `secrets` with gitleaks |
| S10 | A mail security scanner prefetches an unsubscribe link | Nothing changes; the endpoint rejects GET | `POST` only handler, confirm button on the page |
| S11 | Someone posts an unsubscribe for a guessed address with no token | 403, nothing written | `unsubscribe.test.ts` |
| S12 | Sanity is unreachable when a crawler requests the sitemap | 200 with the static paths, warning logged | `try`/`catch` in `src/app/sitemap.ts` |
| S13 | `assertNoLeak` throws on a post render | The error boundary renders, never a partial post | `src/app/(site)/error.tsx` |
| S14 | A keyboard user tabs the cart | Focus ring visible in all five themes | `:focus-visible` rule in `globals.css` |

## What is not measured

No load testing, no Lighthouse budget in CI, no error-rate alerting, and no
uptime monitor. For a study base the cost outweighs the signal. Section 11
records the trigger for each.
