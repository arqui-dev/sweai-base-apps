# 1. Introduction and goals

Hire Service is a study base. It exists to be copied: a running Next.js
application wired to Supabase, Stripe, Sanity and Resend, documented well enough
that the next product starts from a known-good shape instead of a blank
`create-next-app`.

The demonstration product is a one-person consulting site. A visitor reads free
posts, pays once for premium posts, subscribes to a newsletter, and joins a
waitlist or an early-access list. That set was chosen because it exercises every
integration at least once: content, identity, payment, email, and lead capture.

## Quality goals

Ordered. When two conflict, the higher one wins.

| # | Goal | Why it ranks here | How it is checked |
|---|------|-------------------|-------------------|
| 1 | Paid content stays paid | A paywall that leaks is worse than no paywall | `posts.gate.test.ts`, and the body is resolved server-side only when entitled |
| 2 | Reusable without rework | The whole point of a base is the second product | New capture page needs no migration; new theme needs no component change |
| 3 | Every secret stays server-side | One leaked service-role key exposes every table | Only `src/env.ts` reads secret env; gitleaks runs in CI |
| 4 | A new contributor ships in a day | A base nobody understands gets rewritten | arc42 docs, 11 agent and persona files, `npm run verify` |
| 5 | Visual range without forks | Products need different looks, not different code | Five themes over one component tree |

## Stakeholders

| Role | Expects |
|------|---------|
| Owner and sole engineer | To copy this repo and have the next product's plumbing already done |
| Reader | Posts that load fast and a payment that takes two clicks |
| Paying reader | Access that survives signing up after paying |
| Content editor | To publish without a deploy |
| AI coding agent | Enough written context to make the hundred small calls the way the owner would |
