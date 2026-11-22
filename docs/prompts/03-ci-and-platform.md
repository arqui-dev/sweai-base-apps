# 03: Review CI and the Vercel platform configuration

**Status:** `ready`
**Agent:** `devops-platform-engineer`
**Linear:** UNTRACKED
**Created:** 2026-11-21

Review `.github/workflows/ci.yml`, `.github/dependabot.yml`, `next.config.ts`,
`vitest.config.mts`, `scripts/` and the Vercel project configuration for
`sweai-base-apps` and `sweai-storybook`.

Four known problems to resolve, not rediscover:

1. **Vercel runs Node 26.x; CI pins 22 and local is v22.18.0.** Production runs
   a major nothing tests against. Decide the version to standardize on and make
   the change in every place that states one, including `engines`.
2. **Four Dependabot pull requests fail at `npm ci`** (#2, #3, #4, #6). The
   `vite-plus` override that was suspected has since been removed and proven
   unnecessary, so re-diagnose from scratch. Reproduce with
   `git fetch origin <branch> && git checkout FETCH_HEAD && npm ci`.
3. **Secrets share one environment variable row across production and preview**,
   so a live Stripe key cannot reach production without also reaching preview.
4. **Eight keys had duplicate rows with overlapping targets.** `scripts/env-push.sh`
   was fixed to delete before create; verify the fix and whether duplicates
   remain on the project.

Then report anything else in CI or the platform that is wrong and not on that
list. Apply the changes you own in the repository. State clearly which changes
need a dashboard action and cannot be made from here.

## Log

- **2026-11-21** Written. Items 1 and 3 come from the release-checker run on
  2026-11-11; items 2 and 4 from the same run with item 4 partially fixed since.
