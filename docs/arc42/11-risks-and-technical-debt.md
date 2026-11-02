# 11. Risks and technical debt

Every entry names the trigger that makes it worth fixing. An item with no
trigger is not debt, it is a preference.

## Deliberate shortcuts

These carry a `ponytail:` comment in the code. Run `/ponytail-debt` to harvest
the current list.

| Shortcut | Where | Ceiling | Fix when |
|----------|-------|---------|----------|
| Rate limiting is per serverless instance | `src/lib/rate-limit.ts` | A distributed script bypasses it by spreading requests | The forms get real spam, or a limit has to be provable |
| Logger is `console` plus JSON | `src/shared/logger.ts` | No sampling, no structured alerting | An incident needs correlation across requests |
| Cart state is component state | `src/app/(site)/cart/cart-client.tsx` | Nothing persists across a reload | A second product exists |
| No `user_id` backfill on signup | `supabase/schema.sql` | Entitlement rows keep a null `user_id` for guest buyers | A report needs to join entitlements to profiles by id |
| `cacheComponents` off | `next.config.ts` | Every page is server-rendered on demand | A route is genuinely static and build or response time hurts |
| Campaign send has no scheduler | `POST /api/newsletter/send` | Sends are manual curl calls | More than one campaign a month |

## Risks

| Risk | Impact | Current mitigation | Trigger to do more |
|------|--------|--------------------|--------------------|
| A refunded or disputed payment keeps its premium access | Direct revenue loss, and it is unbounded | None today. Only `checkout.session.completed` is handled | Before the first real charge. See F1 in the Stripe review |
| Delayed payment methods never grant access | Pix and Boleto buyers pay and get nothing | None today. Those settle via `async_payment_succeeded`, which is unhandled | Before enabling any Brazilian payment method. See F2 |
| Webhook not configured after a deploy | Payments succeed, access is never granted | `/success` tells the buyer to reload and sign in | Add a Stripe webhook health check to the deploy checklist the first time it happens |
| Previews share the dev Supabase project | A bad preview can dirty dev data | Dev project holds no real data | Real user data lands in the dev project |
| Guest buyer never signs up | Entitlement exists, nobody uses it | Receipt email explains signing in with the same address | Measurable share of guest purchases going unclaimed |
| CSP is report-only | An injected script would run | Headers plus React escaping plus no `dangerouslySetInnerHTML` | Before any real customer traffic: read the reports, then enforce |
| Sanity dataset is public-read | Draft content could be fetched with a guessed query | Queries exclude `drafts.**`, and premium bodies gate on `$entitled` | Content becomes commercially sensitive |
| The hosted Studio drifts from the schema in git | Editors see fields that no longer match what the queries read | The schema is version controlled, and `npx sanity deploy` is one command | Add the deploy to a release checklist the first time it is forgotten |
| `NEWSLETTER_SECRET` rotation breaks mailed unsubscribe links | Recipients see "not valid" and cannot leave | Documented as rotate-never in section 7, and the profile page carries a freshly signed link | A compromise forces rotation: accept both the old and new secret for one mailing cycle |
| A new placeholder is added without allowlisting it | The secrets job fails and the real signal gets ignored | `.gitleaks.toml` and CLAUDE.md list every placeholder, and the allowlist is value-scoped so it cannot hide a real key | Placeholders outgrow a hand-maintained list |
| No uptime or error alerting | A broken grant path could go unnoticed | Vercel logs | The site stops being a study project |

## Known gaps, by request

Recurring subscriptions, refunds, invoices, multi-currency, team accounts,
comments, search, i18n, and an admin UI for leads. None are started. Each would
be a new ADR, not a patch.
