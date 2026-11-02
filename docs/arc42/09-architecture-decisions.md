# 9. Architecture decisions

ADRs follow the MADR format from
`ai-software-engineering/prompts/adrs/madr-template.md`. Numbers are assigned
at merge time.

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](../adr/ADR-001-next-route-handlers-over-nestjs.md) | Next.js route handlers instead of a separate NestJS service | Accepted |
| [ADR-002](../adr/ADR-002-rls-as-the-authorization-layer.md) | Supabase row level security as the authorization layer | Accepted |
| [ADR-003](../adr/ADR-003-entitlements-keyed-by-email.md) | Entitlements keyed by email with an optional user id | Accepted |
| [ADR-004](../adr/ADR-004-css-custom-properties-for-theming.md) | CSS custom properties for theming instead of per-theme components | Accepted |
| [ADR-005](../adr/ADR-005-paywall-enforced-in-the-groq-query.md) | Enforce the paywall in the GROQ query | Accepted |
| [ADR-006](../adr/ADR-006-hosted-sanity-studio.md) | Host the Sanity Studio on Sanity instead of embedding it | Accepted |

## Open questions

Two decisions block the Invoicing half of the Stripe integration and only
arqui.dev can answer them. Both are recorded in
[the Stripe review](../stripe-integration-review.md).

| Question | Why it blocks |
|----------|---------------|
| Are invoices raised in the Stripe Dashboard or from an admin route in this application? | The dashboard needs no code and no new table; an admin route needs both |
| Is `automatic_tax` correct for consulting services billed in Brazil? | A tax question, not a code question, and it changes every session and invoice created |
