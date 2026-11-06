# AI roadmap

Agents and automated checks still to build. The repository already has six
agents in [`.claude/agents/`](../.claude/agents); this is the backlog, not the
inventory.

Each item says what triggers it, what it would own, and what has to exist
first. An item with no trigger is a preference, not a plan.

Built and moved out: `security-reviewer` and `dependency-reviewer`, both now in
`.claude/agents/`.

The current inventory of everything available, and which layer owns it, is in
[`docs/ai-tooling.md`](ai-tooling.md). This file is only what does not exist
yet.

## Agents to build

| # | Agent | Owns | Triggered by | Blocked on | Priority |
|---|-------|------|--------------|------------|----------|
| A3 | `migration-writer` | Turns a change to `supabase/schema.sql` into a forward migration plus the `alter table` statements for an already-applied database, and checks RLS is enabled on anything new | A diff to `supabase/schema.sql` | Deciding whether to adopt the Supabase CLI migration folder | Medium |
| A4 | `stripe-reviewer` | Checks payment changes against the eight findings in [the Stripe review](stripe-integration-review.md): refunds revoke access, async payment methods are handled, amounts come from server config, events are idempotent | A diff to `src/features/payments` or the webhook | F1 and F2 from the Stripe review being fixed first, so the agent has a correct baseline | Medium |
| A5 | `a11y-reviewer` | Focus order, landmark structure, reduced motion, and the keyboard path through each flow. Contrast is a unit test and axe runs on every story, so it checks neither again | A diff to `src/components` or `src/app/(site)` | Nothing | Low, now that axe gates the stories |
| A6 | `copy-reviewer` | Enforces `ai-software-engineering/guidelines/writing-style.md` on user-facing strings and docs: active voice, no em dashes, no buzzwords, numbers over adjectives | Any diff touching copy or `docs/` | Nothing | Low |

## Checks to automate

| # | Check | Why | Blocked on | Priority |
|---|-------|-----|------------|----------|
| C1 | Browser smoke suite in CI | Partly done: every story now runs in Chromium under `npm run test`, with a11y at `error`, so component rendering and accessibility are covered per PR. Still uncovered are the flows that need a server: theme cookie persistence across a navigation, the proxy redirect on `/profile`, and the 503 hint. Those live in hand-run Playwright scripts | Deciding whether a full-app browser pass runs per PR or nightly, since it needs a production build | Medium |
| C2 | RLS policy tests against a real Postgres | Authorization is SQL ([ADR-002](adr/ADR-002-rls-as-the-authorization-layer.md)) and is the one layer with no automated test. A policy regression currently fails silently as an empty list | A local Supabase or Postgres in CI | High |
| C3 | Drive build-time `npm audit` to zero | Would let [ADR-007](adr/ADR-007-dependency-and-vulnerability-policy.md) collapse to a single strict gate over the whole tree, which is option B in that ADR | Upstream: `@sanity/cli` shipping a clean tree, or the Studio moving out of this repository | Medium |
| C4 | Lighthouse or Core Web Vitals budget | Performance is asserted nowhere. Section 10 lists a 1s TTFB goal with no measurement | C1, same harness | Medium |
| C5 | `sanity deploy` in the release path | The hosted Studio can drift from `sanity/schema/` ([ADR-006](adr/ADR-006-hosted-sanity-studio.md)) | A Sanity deploy token in CI | Medium |
| C6 | SBOM as a build artifact | ADR-007 section 6 covers pipeline integrity but produces no bill of materials | Nothing, `npm sbom` exists | Low |
| C7 | Webhook delivery monitor | A misconfigured Stripe webhook means payments succeed and nobody gets access, and today only a log line records it | An alerting destination | Low |

## Product work that needs a decision first

Not AI work, but it blocks the agents above. Listed so the dependency is
visible.

| Item | Decision needed from arqui.dev |
|------|--------------------------------|
| Stripe Invoicing | Are invoices raised in the Stripe Dashboard or from an admin route here? |
| Tax handling | Does `automatic_tax` apply to consulting services billed in Brazil? |
| Stripe F1 and F2 | Both are revenue bugs and both are ready to build; they need a go-ahead, not a decision |

## How to use this file

Pick the highest-priority unblocked row. When an agent is built, move it out of
here and into `.claude/agents/`, add it to the table in `CLAUDE.md`, and delete
its row. When a check is automated, add it to `.github/workflows/ci.yml` and
delete its row. A roadmap that only grows is a wish list.
