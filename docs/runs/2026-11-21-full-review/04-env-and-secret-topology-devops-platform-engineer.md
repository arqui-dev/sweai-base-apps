# 04: Environment variable and secret topology

**Role:** `devops-platform-engineer`
**Prompt:** `docs/prompts/04-env-and-secret-topology.md`

## What changed

One line, in `src/features/newsletter/newsletter.service.ts`. The `else`
branch at line 81 now logs `logger.info("skipped Resend audience add:
RESEND_AUDIENCE_ID not configured")` when `sendWelcome` skips
`resend.contacts.create`. Everything else in this file is a read-only finding.
No infrastructure, Terraform, or Helm exists in this repository to build; the
scope here is `src/env.ts`, `src/env.public.ts`, `scripts/env-push.sh`, and the
live Vercel project `sweai-base-apps`, read through its API with the CLI's
stored token.

## Findings, worst first

### 1. Eight keys hold overlapping, non-deterministic rows in the live Vercel project right now

`scripts/env-push.sh` documents this exact failure in its own comment (lines
72-76): a plain run (targets `development,preview`) and a `--production` run
(targets `production,preview,development`) each upsert by key *and* target
set, so the two runs leave two rows per key instead of replacing one. The
`delete_existing` function (lines 77-89) was added in commit `aff54bc`
(2026-11-11) to fix this going forward: it deletes every row for a key before
creating the new one.

`GET /v9/projects/sweai-base-apps/env` shows the fix has not been applied to
the rows that predate it. Eight keys each carry two rows today:

| Key | Row A target | Row A created | Row B target | Row B created |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `production,preview,development` | 2026-11-02T18:25:42Z | `development,preview` | 2026-11-02T20:34:28Z |
| `NEXT_PUBLIC_SUPABASE_URL` | `production,preview,development` | 2026-11-02T18:25:43Z | `development,preview` | 2026-11-02T20:34:29Z |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `production,preview,development` | 2026-11-02T18:25:43Z | `development,preview` | 2026-11-02T20:34:29Z |
| `NEXT_PUBLIC_SANITY_DATASET` | `production,preview,development` | 2026-11-02T18:25:44Z | `development,preview` | 2026-11-02T20:34:32Z |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | `production,preview,development` | 2026-11-02T18:25:44Z | `development,preview` | 2026-11-02T20:34:32Z |
| `COFFEE_UNIT_AMOUNT` | `production,preview,development` | 2026-11-02T18:25:45Z | `development,preview` | 2026-11-02T20:34:30Z |
| `COFFEE_CURRENCY` | `production,preview,development` | 2026-11-02T18:25:13Z | `development,preview` | 2026-11-02T20:34:31Z |
| `RESEND_FROM` | `production,preview,development` | 2026-11-02T18:25:46Z | `development,preview` | 2026-11-02T20:34:33Z |

The `development,preview` row's creation timestamp (20:34-20:35) lines up with
the commit timestamp of `9fff7d8`, the script's first commit, which predates
the fix by 9 days. Both rows target `preview`, so which value a preview
deployment actually receives for these 8 keys is undocumented and
unverified from here. Re-running `npm run env:push -- --production` against
the current `.env.local` would resolve this, since `delete_existing` now
clears both rows before creating one, but nobody has run it since the fix
landed. This is an operator action, not a code change, so it is not run from
this session.

### 2. `delete_existing` matches by key only, with no target filter. It is not safe against a row set by hand for a different target

`scripts/env-push.sh` lines 77-89:

```bash
delete_existing() {
  local key="$1"
  local ids
  ids=$(curl -sS "https://api.vercel.com/v9/projects/$PROJECT/env?decrypt=false" \
        -H "Authorization: Bearer $TOKEN" \
    | tr '{' '\n' | grep -F "\"key\":\"$key\"" \
    | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
  for id in $ids; do ...
```

This deletes every row for `$key` across every target, then the main loop
creates exactly one new row scoped to `$TARGETS` (lines 35 or 40). The script's
own header (lines 16-18) says a key needing different values per environment
should be "set in the dashboard rather than here", but the delete step does
not honor that split: if an operator later sets, by hand, a
`production`-only row with a value that differs from `.env.local` (a live
Stripe key, say, scoped only to production while `.env.local` carries the
test key), a plain `./scripts/env-push.sh` run (targets `development,preview`
only) deletes that hand-set production row and does not recreate anything for
`production`. The key then has no production row at all, and `env.ts`'s
random-byte fallback takes over for every production request, until someone
notices. The fallback still fails closed, so this degrades safely, but
silently, and it is the opposite of what the operator intended by splitting
the row in the dashboard. The placeholder and localhost refusal rules (lines
117-126) do not cover this case; they only skip a value, never a target.

The placeholder refusal and the localhost refusal themselves are correct and
match CLAUDE.md's "no committed placeholder in a deployed environment" rule:
both checks run before `delete_existing` is called, so a placeholder or
localhost value in `.env.local` never touches the live row.

### 3. `RESEND_AUDIENCE_ID` is confirmed empty in production, and the skip was unlogged

`GET /v9/projects/sweai-base-apps/env?decrypt=true` returns a `RESEND_AUDIENCE_ID`
row targeting `production,preview,development`, type `plain`, value length
`0`. `src/env.ts` line 61 trims it, finds it empty, and omits the key from
the parsed object entirely (the field is `.optional()` in the schema, so no
fallback is recorded and `unconfiguredServerVars` never names it).
`newsletter.service.ts`'s `sendWelcome` (previously lines 78-81) checked
`if (env.RESEND_AUDIENCE_ID)` and skipped `resend.contacts.create` with no
log on the `false` branch. Every welcome email sent in production has been
silently not added to the Resend audience since whenever the key went empty,
and there was no log line to show it.

Fixed in this diff: the `else` branch now calls
`logger.info("skipped Resend audience add: RESEND_AUDIENCE_ID not configured")`,
matching the existing `logger.info` call two lines above it for the
opted-out no-op, and the "no unlogged ... event" pattern CLAUDE.md already
states for rate-limit and admin-token rejections.

### 4. Informational: the preview fallback host is also behind SSO, not just the production one

The project's `ssoProtection.deploymentType` is `all_except_custom_domains`,
confirmed via `GET /v9/projects/sweai-base-apps`. `env.public.ts`'s comment
(lines 46-51) says `NEXT_PUBLIC_VERCEL_URL` "is still the right answer for a
preview, where there is no stable alias" — true, there is no better
alternative, but the per-deployment `*.vercel.app` host it falls back to is
not a custom domain either, so it sits behind the same SSO wall as
production did before this fallback chain existed. An anonymous magic-link
click or a Stripe webhook arriving at a preview deployment's own URL hits the
Vercel SSO page the same way a customer would have on production. This is
expected for a preview environment and not a regression this review
introduces, but it means the fallback chain only solves the problem for
production; preview is not reachable by an anonymous party either way,
by design of Standard Deployment Protection, not by a bug in this code. No
change proposed.

### 5. Out of scope: `npm run build` surfaced a Next.js security-advisory gate, unrelated to env topology

The first `npm run build` run stopped with `SecurityFatalError`, naming a
known vulnerability in the installed Next.js version and prompting a
`next upgrade --agent=security` flow. A second run of the identical command
completed the build successfully (see Verification below), which is the
documented behavior of that gate: it blocks once to surface the advisory,
then lets the build proceed. CLAUDE.md's dependency policy says a version
bump is its own change, never mixed with a functional one, so no upgrade is
attempted here. This belongs to `docs/dependencies.md` or a tracked item for
whoever next bumps Next.js, not to this prompt.

### Items that checked out clean

- **Fallback chain for every secret (`src/env.ts` lines 70-103).** Every
  variable in the forbidden-pattern list, `SUPABASE_SECRET_KEY`,
  `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
  `ADMIN_API_TOKEN`, `NEWSLETTER_SECRET`, falls back to freshly generated
  random bytes (`randomSecret()`, `node:crypto`'s `randomBytes(24)`), each
  wrapped in the prefix its own schema validation requires, so the fallback
  always parses. None has a path to a fixed string. `RESEND_FROM` is not a
  credential and falls back to a fixed sentinel address by design, which is
  correct for a non-secret.
- **Site URL fallback vs. Vercel's documented system variables
  (`src/env.public.ts` lines 56-65).** Checked against Vercel's first-party
  "System environment variables" reference, not the code comment, per the
  prompt. `VERCEL_PROJECT_PRODUCTION_URL` ("A production domain name of the
  project... always set, even in preview deployments") and `VERCEL_URL` ("The
  domain name of the generated deployment URL") behave exactly as the code
  assumes: production prefers the project's production alias, preview falls
  back to its own per-deployment host because no stable alias exists for a
  preview. `autoExposeSystemEnvs: true` on the live project (confirmed via
  the Vercel API) means the `NEXT_PUBLIC_` prefixed copies the code reads
  are actually populated by Vercel; this is a load-bearing project setting,
  not a given.
- **`.env.example` vs. what the code reads, key for key.** See the table
  below. All 17 keys match exactly.

## Key-by-key coverage (item 4)

| Key | `.env.example` | Read by `env.ts` / `env.public.ts` | `.env.local` | Live in Vercel (targets) |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | yes | yes | yes, 2 rows (see Finding 1) |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | yes | yes | yes, 2 rows |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | yes | yes | yes, 2 rows |
| `SUPABASE_SECRET_KEY` | yes | yes | yes | yes, 1 row (`production,preview,development`, encrypted) |
| `STRIPE_SECRET_KEY` | yes | yes | yes | yes, 1 row (encrypted) |
| `STRIPE_WEBHOOK_SECRET` | yes | yes | yes | yes, 1 row (encrypted) |
| `COFFEE_UNIT_AMOUNT` | yes | yes | yes | yes, 2 rows |
| `COFFEE_CURRENCY` | yes | yes | yes | yes, 2 rows |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | yes | yes | yes, 1 row |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | yes | yes | yes, 2 rows |
| `SANITY_API_READ_TOKEN` | yes | yes (optional) | **no** | yes, 1 row (encrypted) |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | yes | yes (optional) | yes | yes, 2 rows |
| `RESEND_API_KEY` | yes | yes | yes | yes, 1 row (encrypted) |
| `RESEND_FROM` | yes | yes | yes | yes, 2 rows |
| `RESEND_AUDIENCE_ID` | yes | yes (optional) | **no** | yes, 1 row, value empty (Finding 3) |
| `ADMIN_API_TOKEN` | yes | yes | yes | yes, 1 row (encrypted) |
| `NEWSLETTER_SECRET` | yes | yes | yes | yes, 1 row (encrypted) |

17 of 17 keys that `.env.example` lists are read by `src/env.ts` or
`src/env.public.ts`, and no key read by either file is missing from
`.env.example`. `NODE_ENV` and the three `NEXT_PUBLIC_VERCEL_*` system
variables are read by the code but correctly absent from `.env.example`;
Vercel and Next.js set those, not the operator.

`SANITY_API_READ_TOKEN` and `RESEND_AUDIENCE_ID` are absent as keys in
`.env.local` (not present even as empty lines), which is harmless because
both are `.optional()` in their schemas and an absent key parses the same as
an empty one. Not a defect; noted because the prompt asked for coverage
measured, not inferred.

## Verification

Ran from `/Users/andre/Work/hire-service` after the one-line edit to
`newsletter.service.ts`:

```
$ npm run verify
> typecheck: next typegen && tsc --noEmit  →  Types generated successfully, no tsc errors
> lint: eslint  →  clean, no output
> test: vitest run  →  Test Files 16 passed (16), Tests 122 passed (122)
```

```
$ npm run build
# first invocation: stopped on a Next.js SecurityFatalError advisory nudge
# (Finding 5, unrelated to this change)
$ npm run build
# second invocation: completed. 25 routes rendered, 23 dynamic, 2 static
# (/robots.txt, /sitemap.xml). No errors.
```

`npm run audit:runtime` and `npm run scan:secrets` were not run: the change is
a log line in an already-reviewed branch of existing code, touches no
dependency and introduces no key-shaped string, and CLAUDE.md scopes those two
gates to dependency and secret-shaped changes respectively.

## What this session could not reach

- **Whether re-running `npm run env:push -- --production` now actually
  collapses the 8 duplicate-row keys.** This session has read-only access to
  the Vercel API (list and decrypt-read only); running the script would
  create and delete rows, which this session is not permitted to do. An
  operator needs to run it and confirm the row count per key drops to one.
- **Which of the two rows per duplicated key Vercel is actually serving to a
  live preview deployment today.** Not documented by Vercel's API response
  order, and not worth guessing at. Worth checking directly against a real
  preview deployment's resolved `process.env` if the duplicate persists past
  the next env push.
- **Whether the hand-set-row safety gap in Finding 2 has ever actually fired**
  (i.e., whether any key in this project was ever split by target in the
  dashboard and then collapsed by a subsequent script run). The API response
  does not carry enough history to tell; nothing currently live suggests it
  has, since the two rows per key at the timestamps above were both created
  by this script's own two run modes, not by hand.
