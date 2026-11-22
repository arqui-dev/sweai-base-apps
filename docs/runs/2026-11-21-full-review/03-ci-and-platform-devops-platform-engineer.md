# 03: CI and the Vercel platform configuration

**Role:** `devops-platform-engineer`
**Prompt:** `docs/prompts/03-ci-and-platform.md`

## Repository state before this run

The brief's Stage 0 ref record said `hire-service` was 0 dirty at measurement
time. It was not, by the time this session read it: `M CLAUDE.md` and
`?? docs/prompts/` were already present (the orchestrator's own setup for this
batch, confirmed against `docs/runs/2026-11-21-full-review/README.md`). A
sibling run in the same batch also left `src/features/newsletter/*` touched
and `docs/adr/ADR-NNN-*` untracked; none of that is this prompt's scope and
none of it was touched here. No other repository was opened, so no second
measurement applies.

## What changed in the repository

Three files, all for item 1 (the Node version split):

| File | Change |
|---|---|
| `package.json` | `engines.node`: `>=22.0.0` → `26.x` |
| `.github/workflows/ci.yml` | both `node-version: 22` → `node-version: 26` (the `verify` and `dependencies` jobs) |
| `.nvmrc` | created, content `26` |

No other file changed. Items 2, 3, and 4 are diagnosis and reporting only, for
the reasons stated under each.

## Findings, worst first

### 1. Item 3, unresolved: every secret still shares one row across production, preview, and development

Confirmed live via `GET /v9/projects/sweai-base-apps/env?decrypt=false`. All
seven encrypted keys (`SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `SANITY_API_READ_TOKEN`,
`ADMIN_API_TOKEN`, `NEWSLETTER_SECRET`) carry exactly one row each, target
`["production","preview","development"]`. A live Stripe secret key cannot
reach production without the same request also making it readable to every
preview deployment, which is a PR-triggered, lower-trust environment. This
matches `CLAUDE.md`'s own "Environments and promotion order" section, which
already states the risk and says to split the rows "before any live
credential is set."

This is a dashboard (or authenticated API) action, not a repository change:
for each of the seven keys, create a `production`-only row carrying the live
value, then a separate `preview,development` row carrying a non-production
value, then delete the current combined row. `scripts/env-push.sh` already
refuses to do this itself (its own header says a key needing different values
per environment belongs in the dashboard), so the fix cannot be scripted from
here either. This session has read-only Vercel access and does not create,
update, or delete a variable.

### 2. Item 4, unresolved on the live project: the eight duplicate-row keys are still there

`scripts/env-push.sh` lines 72-89 confirm the fix by reading: `delete_existing`
now deletes every row for a key before creating the new one, closing the gap
described in its own comment (two run modes, `development,preview` and
`production,preview,development`, upserting on key *and* target set, leaving
two rows per key). The fix is sound as written.

The live project was not re-pushed since the fix landed. `GET
/v9/projects/sweai-base-apps/env` returns exactly eight keys with two
overlapping rows each, matching the prompt's count precisely:
`RESEND_FROM`, `NEXT_PUBLIC_SANITY_STUDIO_URL`, `NEXT_PUBLIC_SANITY_DATASET`,
`COFFEE_CURRENCY`, `COFFEE_UNIT_AMOUNT`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SITE_URL`. Every one of the sixteen
rows targets `preview`, so two rows compete for what a preview deployment
actually reads, and which one wins is undocumented from the API response
order alone. The sibling run on `docs/prompts/04-env-and-secret-topology.md`
reached the same eight keys independently, with row creation timestamps; see
`04-env-and-secret-topology-devops-platform-engineer.md` for that detail,
rather than duplicating it here.

Remediation is `./scripts/env-push.sh --production` run once against the
current `.env.local`: the fixed `delete_existing` collapses both rows to one
per key. That is a live mutation against Vercel's API, outside this session's
read-only access. Named, not run.

### 3. Item 2, re-diagnosed: two PRs fail `npm ci` from a lockfile-fidelity gap in npm itself, one PR fails from a real, upstream peer-dependency ceiling

Reproduced all four named PRs plus the current patch-and-minor group PR that
superseded the closed one, each with `git fetch origin <branch> && git
checkout FETCH_HEAD && npm ci` against a clean clone and a clean npm cache
(`--cache`, not the ambient user cache), so no left-over `node_modules` or
cache state from one branch could explain another's result.

| PR | Branch | `npm ci` | `npm install --package-lock-only --dry-run` |
|---|---|---|---|
| #2 | `eslint-10.14.0` | fails, `EUSAGE`, "Missing: typescript@7.0.2" and 20 platform packages | reports "up to date", no change needed |
| #3 | `@types/node-26.6.6` | fails, same `EUSAGE`, same missing set | reports "up to date" |
| #4 | `typescript-7.0.2` | fails, `EUSAGE`, "Missing: typescript@5.9.3" | resolves, but only by overriding a hard peer conflict (below) |
| #8 (supersedes closed #6) | `patch-and-minor-3e74a3b2fc` | **passes**, 1358 packages installed | n/a |

**#2 and #3: an npm CLI lockfile-fidelity bug, not a problem in this repo's
manifest.** On both branches, `npm install` (the full resolver) accepts the
Dependabot-written lockfile as already in sync; only `npm ci`'s narrower
fidelity check rejects it, and it rejects it by demanding a brand-new
`typescript@7.0.2` that neither `package.json` nor `package-lock.json` asks
for anywhere, root or nested. `typescript@7.0.2` is real (`npm view
typescript@7.0.2` confirms it, with the twenty per-platform
`@typescript/typescript-*` optional binaries listed as fatal "Missing" lines);
it is the latest version matching a wide, already-satisfied, non-optional peer
range declared by a Next.js module-federation dependency
(`"typescript": "^4.9.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"`, present on `main`
too, unrelated to either PR's own bump). `npm ci`'s lockfile-sync check
re-resolves that peer edge against "latest matching" instead of recognizing
the root's own `typescript@^5` already satisfies it; `npm install` does not
make that mistake. This is the documented class of bug tracked upstream as
npm/cli issues
[#9846](https://github.com/npm/cli/issues/9846),
[#10193](https://github.com/npm/cli/issues/10193),
[#8726](https://github.com/npm/cli/issues/8726), and
[#8674](https://github.com/npm/cli/issues/8674): `npm ci` rejecting a lockfile
that `npm install` itself just wrote or accepted, specifically around optional
and peer dependency edges. It reproduces with the CI-pinned Node 22's bundled
npm (10.9.3) here.

Confirmed fixable in-place: running a full `npm install` (not
`--dry-run`) on the `eslint-10.14.0` branch rewrote 608 lines of
`package-lock.json`, after which `npm ci` against that regenerated lockfile
succeeds cleanly. The fix is for whoever pushes to each Dependabot branch to
run `npm install` and commit the regenerated lockfile (or trigger
`@dependabot recreate`, which re-runs its own updater and may or may not land
on a lockfile `npm ci` accepts, since the updater's own lockfile-only path is
what produced the rejected one). This session does not push to a PR branch:
see "Never commit, push, or apply" in this role's own definition.

**#4 is a genuine, currently-unresolvable incompatibility, not an npm quirk.**
Bumping `typescript` to `7.0.2` conflicts with `typescript-eslint@8.72.1`
(pulled in by `eslint-config-next@16.4.3`), whose own peer range is
`"typescript": ">=4.8.4 <6.1.0"`, confirmed both in the lockfile and via `npm
view typescript-eslint@8.72.1 peerDependencies`. Checked whether a newer
`typescript-eslint` lifts the ceiling: `npm view typescript-eslint@latest`
resolves to `8.73.0` with the identical `<6.1.0` cap; no published version
accepts TypeScript 7 yet. `npm install` "resolves" this branch only by
force-overriding the conflict (`ERESOLVE overriding peer dependency`), which
means typescript-eslint would run against a TypeScript major it explicitly
does not support, not something to ship. **This PR should stay open and
unmerged** until `typescript-eslint` publishes a release compatible with
TypeScript 7; it is not a lockfile problem to regenerate away.

**#6/#8: the previously suspected cause is confirmed gone, and so is the
failure.** The prompt's own log already records the `vite-plus` override as
removed and proven unnecessary; this run did not reinstate it per the
constraint, and did not need to: #8, the current patch-and-minor group PR
that superseded the closed #6, installs cleanly with a plain `npm ci`. Whatever
combination of packages in the 21-update #6 group tripped the override
suspicion no longer reproduces in the 23-update #8 group.

### 4. Item 1, fixed here: Vercel's Node major and CI's pinned major had drifted apart, and `engines` was silently resolving to a third one

`GET /v9/projects/{id}` for both `sweai-base-apps` and `sweai-storybook`
returns `nodeVersion: "26.x"`. CI pinned `node-version: 22`. Local was
`v22.18.0`. `package.json` said `"node": ">=22.0.0"`, which does not pin
Vercel to 22 at all: Vercel's own documented version-mapping table
([Supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions))
states explicitly that a range such as `>=22.0.0` resolves to "the latest
26.x version," the same as `26.x` or `^26.0.0` would. The `engines` field was
never pinning the build; it was only ever wide enough to let Vercel pick
whatever its current default is, which happened to drift to 26.x as that
became Vercel's default LTS. Nothing was testing against the major that
production actually runs.

**Resolved on 26, not rolled back to 22.** Per the Node.js release schedule
([nodejs/Release `schedule.json`](https://github.com/nodejs/Release)), as of
this run: Node 22 ("Jod") entered Maintenance LTS 2025-10-21, EOL
2027-04-30; Node 24 ("Krypton") entered Maintenance LTS 2026-10-20, EOL
2028-04-30; Node 26 ("Lithium") entered **Active** LTS 2026-10-28, EOL
2029-04-30. 26 is both the newest Active LTS and the one with the longest
remaining horizon, and it is already what Vercel deploys. Checked the three
packages in this tree most likely to care about a major bump:
`next@16.4.3` requires `node >=20.9.0`, `playwright@1.64.1` requires `node
>=20`, `vitest@5.0.5` requires `node "^22.12.0 || ^24.0.0 || >=26.0.0"`. None
objects to 26.

Changed: `package.json` `engines.node` to the exact `"26.x"` (the literal
syntax Vercel's own docs use for an exact pin, so it can no longer silently
resolve to whatever Vercel defaults to next), both `node-version: 22` lines in
`.github/workflows/ci.yml` to `26`, and added `.nvmrc` containing `26` (the
operator's shell resolves `node`/`npm` through `nvm`, confirmed by
`which node` resolving under `~/.nvm/versions/node/`, and no `.nvmrc` existed
for `nvm use` to read).

**Not fixed here, needs the operator:** the local toolchain is still Node
`v22.18.0`. `npm` only warns on an `engines` mismatch by default (no
`engine-strict` in any `.npmrc` here), so nothing broke running the
verification commands below on 22.18.0, but the operator's daily driver no
longer matches CI, Vercel, or the pin. Run `nvm install 26 && nvm use` (the
new `.nvmrc` makes `nvm use` alone sufficient afterward).

**Dashboard note, not an action:** Vercel's project `nodeVersion` for both
projects already reads `26.x`, so this fix requires no dashboard change. It
was already correct; only the two other places were not pointing at it.

### Other CI and platform items checked, no finding

- **Third-party Action pins.** `actions/checkout@3d3c42e5a...` and
  `actions/setup-node@949feb241...` both resolved, via `gh api
  repos/<owner>/<repo>/git/refs/tags/<tag>`, to the exact SHA the workflow
  comments claim (`v7.0.1` and `v7.1.0` respectively), and both tags are each
  repo's current `releases/latest`. No drift, no stale pin.
- **gitleaks pin.** `GITLEAKS_VERSION: 8.30.1` is the current latest release.
  `GITLEAKS_SHA256` matches the published `gitleaks_8.30.1_checksums.txt`
  entry for `gitleaks_8.30.1_linux_x64.tar.gz` byte for byte.
- **`.github/dependabot.yml`.** Groups patch-and-minor npm updates into one PR
  and leaves majors (this run's #2, #3, #4) individual, matching the stated
  policy in its own header comment. The GitHub Actions ecosystem entry is
  also present and weekly. No change.
- **`vitest.config.mts`.** The `node` and `storybook` projects match what CI
  actually runs (`npx playwright install --with-deps chromium` before `npm run
  test`); nothing in it assumes a Node major, and Node 26 does not change
  that.
- **`next.config.ts`.** The report-only CSP and its flip condition, and the
  `unsafe-eval` leftover with its own removal note, are already documented in
  the file and already settled per reviewer memory. Not re-reported.
- **Vercel project settings beyond `nodeVersion`.** `buildCommand`,
  `installCommand`, `outputDirectory`, and `rootDirectory` are unset (default)
  on `sweai-base-apps`; `sweai-storybook` has `buildCommand: npm run
  storybook:build` and `outputDirectory: storybook-static`, exactly matching
  `CLAUDE.md`. `autoExposeSystemEnvs: true` on both, which is what makes the
  `NEXT_PUBLIC_VERCEL_*` fallbacks in `src/env.public.ts` actually populated.
  No drift.

## Verification

All run from `/Users/andre/Work/hire-service` after the three-file change
above, on the still-22.18.0 local toolchain (operator action pending, noted
above):

```
$ npm run typecheck   # next typegen && tsc --noEmit
Generating route types... ✓ Types generated successfully

$ npm run lint         # eslint
(clean, no output)

$ npm run test         # vitest run
Test Files  16 passed (16)
     Tests  122 passed (122)

$ npm run build        # next build
✓ Compiled successfully in 823ms
✓ Generating static pages using 7 workers (25/25)

$ npm run audit:runtime  # npm audit --omit=dev --audit-level=info
found 0 vulnerabilities

$ npm run storybook:build
Vite ✓ built in 915ms
Storybook build completed successfully
```

`npm run scan:secrets` was not run: `gitleaks` is not installed in this
session (`which gitleaks` → not found), as `CLAUDE.md` already documents; CI
is the enforcing gate.

PR reproduction (`npm ci` against each Dependabot branch, isolated clone,
isolated `npm --cache`) is reported inline under item 3 above, both the
failing and the passing case, with the `npm install` counter-check for each.

## What this session could not reach

- **Whether re-running `./scripts/env-push.sh --production` actually
  collapses the eight duplicate-row keys, and which value a live preview
  deployment currently resolves for them.** Requires a live mutation this
  session's read-only Vercel access does not permit. Operator action, named
  in item 2.
- **Splitting the seven secret keys into production-only and
  preview/development rows.** Same access limit. Operator action, named in
  item 1.
- **Whether `@dependabot recreate` on PRs #2 and #3 produces a lockfile `npm
  ci` accepts**, versus needing a manual `npm install` and push. Not testable
  without triggering Dependabot or pushing to its branches, both outside this
  session's "never commit, push, or apply" boundary.
- **Local Node 26 itself.** Not installed in this session; the `.nvmrc` and
  `engines` pin are in place for the operator to pick up with `nvm install 26
  && nvm use`.
