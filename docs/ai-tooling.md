# AI tooling inventory

What is available to work on this repository, where each piece comes from, and
which ones we own. Evolving this layer is a goal of the project, not a side
effect of it, so the inventory is version controlled next to the code it acts
on.

Counts and connection status drift. Run `npm run ai:inventory` for the live
picture before editing this file. The judgement about what each thing is *for*
is written by hand, because that part cannot be generated.

**Snapshot: 6 November 2026.** 8 plugins, 10 MCP servers (7 connected,
2 unauthenticated, 2 awaiting approval), 25 user skills plus 68 shipped by
plugins, 8 agents owned by this repository.

## Five layers

Capability arrives from five places, and knowing which one owns a problem is
most of the debugging.

| Layer | Owned by | Changes how often | Example |
|-------|----------|-------------------|---------|
| Harness | Anthropic | On release | Skills, subagents, hooks, Artifacts, scheduled runs |
| Plugins | Third parties and Anthropic | On their release | `superpowers`, `vercel`, `stripe`, `ponytail` |
| MCP servers | Service vendors | On their release | Linear, Notion, Vercel, Stripe, Grafana |
| Workspace | Us, `../ai-software-engineering` | When a convention changes | TypeScript and writing guidelines, DevOps prompts |
| This repository | Us, `.claude/agents/` | Every feature | `security-reviewer`, `paywall-guardian` |

Only the bottom two are ours. The inventory below is ordered that way: what we
own first, because that is what we evolve.

## 1. Agents we own

In `.claude/agents/`, invoked by description. These encode this project's
invariants, which is why a generic reviewer cannot replace them.

| Agent | Model | Fires on | Owns |
|-------|-------|----------|------|
| `security-reviewer` | opus | Route handlers, auth, money, schema, headers, third-party content | OWASP Top 10:2025 and ASVS 5.0, with this repo's entry points, 10 invariants, and the already-fixed list so it does not re-report |
| `dependency-reviewer` | opus | `package.json`, `package-lock.json` | The ladder, the deep scan, the register row. Default answer is no |
| `paywall-guardian` | opus | `features/posts`, `features/payments`, components taking a `Post` | Six invariants that keep paid content paid |
| `rls-reviewer` | opus | `supabase/schema.sql`, new tables or queries | Default-deny policies, ownership predicates, service-role blast radius |
| `arc42-keeper` | opus | Anything that alters the documented architecture | Finds the sentences that became false, fixes only those |
| `theme-smith` | sonnet | A new or edited theme | Sixteen tokens per block, contrast measured by test not by eye |
| `capture-page-builder` | sonnet | A new waitlist or signup page | One enum value, no migration, no second route handler |
| `release-checker` | sonnet | Before a production deploy | The config CI cannot see: webhooks, redirect URLs, live keys |

Still to build, in [the roadmap](ai-roadmap.md): `migration-writer`,
`stripe-reviewer`, `a11y-reviewer`, `copy-reviewer`.

## 2. Workspace conventions

`../ai-software-engineering`, a sibling repository that applies to every
project here.

| Asset | Files | Used for |
|-------|------:|----------|
| `guidelines/typescript.md` | 1 | The 24 golden rules this repo's `tsconfig` and `Result` type come from |
| `guidelines/writing-style.md` | 1 | Prose in docs, ADRs and commits. This repo overrides its commit-body rule |
| `prompts/devops/` | 9 | Terraform review, EKS access, FinOps, OTLP onboarding. Not used here yet |
| `prompts/analysis/` | 2 | Ticket analysis, debug flow |
| `prompts/adrs/` | 2 | The MADR template all eight ADRs follow |
| `mcps/` | 5 | Setup notes for the MCP servers in use |
| `tools/` | 2 | Plugin marketplace guide, security tooling |
| `templates/CLAUDE.md` | 1 | Where this repo's `CLAUDE.md` started |

## 3. MCP servers

Status from `npm run ai:inventory`. The two unauthenticated ones are real
blockers, not noise.

| Server | Status | What it unlocks here |
|--------|--------|----------------------|
| `plugin:stripe:stripe` | **Needs authentication** | `stripe_implementation_planner`, which would generate the integration plan to reconcile against [the Stripe review](stripe-integration-review.md). Blocked: OAuth cannot run inside a tool call. Restart the session, then `/mcp` |
| `plugin:vercel:vercel` | **Needs authentication** | Project and deployment management. Worked around with the CLI and REST API, so not blocking |
| `linear` | Connected | Issues and projects. Not wired to this repo yet |
| `claude.ai Claude Docs` | Connected | Living documents |
| `claude.ai Notion` | Connected | Workspace notes |
| `claude.ai Gmail`, `Google Calendar`, `Google Drive` | Connected | Not used by this project |
| `grafana`, `grafana-nonprod` | Awaiting approval | Another project's observability. Irrelevant here |

## 4. Plugins

| Plugin | Version | Ships | Used here for |
|--------|---------|-------|---------------|
| `vercel` | 0.50.0 | 37 skills, 9 commands, 6 agents, hooks, MCP | Next.js and Vercel practice, deployment, caching, env vars |
| `superpowers` | 7.0.0 | 15 skills, hooks | Brainstorming, systematic debugging, TDD, plan execution |
| `stripe` | 0.11.17 | 10 skills, 2 commands, 1 agent, hooks, MCP | The payment integration, once authenticated |
| `ponytail` | 4.8.4 | 6 skills, 6 commands | The working style this repo is built in. `/ponytail-debt` harvests the deliberate shortcuts |
| `adrs-management` | 1.0.0 | 4 commands, 3 agents | ADR identification and generation at scale |
| `diagrams-generator` | 1.0.0 | 2 commands, 2 agents | C4 and Mermaid from a design document |
| `project-analizer` | 1.0.0 | 2 commands, 3 agents | Architecture reports, dependency audits, component deep-dives |
| `development-guidelines` | 1.0.0 | 1 command | Language guideline lookup |

## 5. Skills reached for in this project

25 are installed for the user; plugins ship 68 more. These are the ones that
have actually done work here, which is the useful subset.

| Skill | Source | Where it was used |
|-------|--------|-------------------|
| `owasp-security` | user | The review that produced [ADR-007](adr/ADR-007-dependency-and-vulnerability-policy.md) and three fixes |
| `webapp-testing` | user | The Playwright checks on themes, cart, forms and the hamburger menu |
| `artifact-design` | harness | The published architecture artifact |
| `ponytail` | plugin | Every build decision, continuously |
| `superpowers:brainstorming` | plugin | Scoping, at the start |
| `accessibility`, `web-design-guidelines`, `design-tokens` | user | Available, not yet run. Overlaps `a11y-reviewer` on the roadmap |
| `frontend-design`, `theme-factory` | user | Not used: the five-theme token system predates them and is the authority |

## Keeping this honest

Three rules, or the inventory becomes a list of things nobody runs.

1. A new agent gets a row in section 1 and a row in `CLAUDE.md`, and its
   roadmap line is deleted. The roadmap tracks what does not exist yet.
2. A skill or plugin that has never done work here belongs in section 5 marked
   as unused, not in a capability claim.
3. `npm run ai:inventory` before editing. A count written from memory is how a
   document starts lying.
