# Run: full review, 2026-11-21

Five prompts from `docs/prompts/`, two producer roles, one batch. Verification
per item by `sre`, close-out by `technical-manager`.

## Authority order

**The verdicts file overrides the producer files. The report overrides the
verdicts.** Producer files are first drafts and carry a first draft's errors.
Never cite a producer finding without checking what the verification pass did to
it.

## Ref record, measured before any agent read any file

| Repository | Branch | HEAD | Behind `origin/main` | Ahead | Dirty |
|------------|--------|------|---------------------:|------:|------:|
| `hire-service` | `main` | `bd42a3d` | 0 | 0 | **2** |
| `ai-software-engineering` | `feat/devops-agent-team` | `7cbfc13` | 0 | **11** | **4** |

**Correction, recorded after dispatch.** The `hire-service` dirty count was
measured as 0 and written here as 0, then the orchestrator edited `CLAUDE.md` to
add the engagement contract sections and created `docs/prompts/` before
dispatching. The real state every agent read was 2 dirty: `CLAUDE.md` modified,
`docs/prompts/` untracked. The item 04 producer caught the discrepancy and
reported it, which is the behavior the brief asked for. The lesson is the gate's
own: measure immediately before dispatch, not before the preparation that
dispatch depends on.

The second row is the reason this gate is not optional. The workspace repository
moved branch between runs: the five commits of pull request #1 now sit on
`feat/devops-agent-team` alongside six later commits by andrevst that built the
four-role team, the `release-management` and `team-run` skills, and the slash
command wrapper. The run proceeds against that branch as-is, because it carries
the agent definitions the run needs. The four dirty files are all untracked and
belong to andrevst: `.DS_Store` twice, `docs/article-index.md`, `docs/articles/`.
No agent touched them.

## Prompts in this batch

| # | Prompt | Role | Status at dispatch |
|---|--------|------|--------------------|
| 01 | Validate the documented architecture against the code | `cloud-solutions-architect` | `ready` |
| 02 | Decide the paywall boundary for a public content dataset | `cloud-solutions-architect` | `ready` |
| 03 | Review CI and the Vercel platform configuration | `devops-platform-engineer` | `ready` |
| 04 | Review the environment variable and secret topology | `devops-platform-engineer` | `ready` |
| 05 | Review the open pull request against the workspace repository | `cloud-solutions-architect` | `ready` |

Nothing was deferred. Five prompts is under the six-agent cap, so the batch is
the whole folder.

`sre` is not given a producer prompt because it verifies every item in stage 2.
`technical-manager` is not given one because it closes the batch in stage 3.
Both roles acting as producer and reviewer in the same run would defeat the
separation the team depends on.

## Access for this run

`--access read-only` on anything networked.

| Allowed | Not allowed |
|---------|-------------|
| Read the repositories and the filesystem | Any write to a cloud provider or dashboard |
| Read Vercel project and environment variable metadata | Create, update or delete an environment variable |
| Read GitHub pull requests, diffs and run logs | Merge, close, comment on, or push a branch |
| Read the Sanity content API anonymously | Any write to Sanity |
| Write files in `hire-service` | Commit to `ai-software-engineering` |

Prompt 02 drafts an ADR without a number and without approval, because the
architect role does not approve its own proposals.

## Known limits before the run started

| Limit | What would close it |
|-------|---------------------|
| The Supabase project is gone. `tvqschzxuflwjrplfhri.supabase.co` returns NXDOMAIN from 1.1.1.1 and 8.8.8.8 | A project created by andrevst, then `supabase/schema.sql` applied |
| `plugin:stripe:stripe` and `plugin:vercel:vercel` MCP servers are unauthenticated | An interactive `/mcp` authentication, which cannot run inside a tool call |
| The eight project reviewers in `.claude/agents/` have never run through the agent registry | A session restart, which registers them |
| No Stripe keys, so no payment path can be exercised end to end | Test keys in `.env.local` and a webhook endpoint |
| `gitleaks` is not installed locally | CI is the enforcing gate and runs it on every push |

## Files

| File | Written by |
|------|-----------|
| `README.md` | the orchestrator, before dispatch |
| `01-architecture-vs-code-cloud-solutions-architect.md` | producer |
| `02-sanity-dataset-paywall-cloud-solutions-architect.md` | producer |
| `03-ci-and-platform-devops-platform-engineer.md` | producer |
| `04-env-and-secret-topology-devops-platform-engineer.md` | producer |
| `05-review-open-pr-cloud-solutions-architect.md` | producer |
| `06-verdicts.md` | `sre`, per item, as each landed |
| `07-report-and-tickets.md` | `technical-manager`, after the barrier |
