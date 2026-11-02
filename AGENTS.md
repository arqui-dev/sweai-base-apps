# AGENTS.md

Instructions for AI agents in this repository. The full rule set, including
blast-radius layers and forbidden patterns, is in [CLAUDE.md](CLAUDE.md). Read
that first.

## Start here

| Question | File |
|----------|------|
| What is this and why | [docs/arc42/01-introduction-and-goals.md](docs/arc42/01-introduction-and-goals.md) |
| How it is put together | [docs/arc42/05-building-block-view.md](docs/arc42/05-building-block-view.md) |
| How a payment or a paywall actually flows | [docs/arc42/06-runtime-view.md](docs/arc42/06-runtime-view.md) |
| Why it is built this way | [docs/adr/](docs/adr/) |
| What it must never do | [CLAUDE.md](CLAUDE.md), "Forbidden patterns" |
| What is deliberately unfinished | [docs/arc42/11-risks-and-technical-debt.md](docs/arc42/11-risks-and-technical-debt.md) |

## Non-negotiable

1. Run `npm run verify && npm run build` before claiming anything works.
2. Never widen the paywall or an RLS policy without running `paywall-guardian`
   and `rls-reviewer`.
3. Deliberate shortcuts carry a `ponytail:` comment naming the ceiling and the
   upgrade path. Do not remove one without removing the shortcut.
4. Prose follows `../ai-software-engineering/guidelines/writing-style.md`. No em
   dashes, active voice, numbers instead of adjectives.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
