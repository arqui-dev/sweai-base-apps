# 04: Review the environment variable and secret topology

**Status:** `ready`
**Agent:** `devops-platform-engineer`
**Linear:** UNTRACKED
**Created:** 2026-11-21

The application boots with every variable empty by design: unset secrets get
random bytes at boot so every signature and token check fails closed, and writes
answer 503 naming what is unset. That behavior is tested in
`src/env.unconfigured.test.ts`.

Review whether the topology around it is right.

1. `src/env.ts` and `src/env.public.ts`: is the fallback chain correct for every
   variable, and does any secret have a path to a non-random fallback?
2. The site URL fallback now prefers `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`
   in production over the per-deployment host. Verify that against Vercel's
   documented system variables rather than against the code comment.
3. `scripts/env-push.sh`: the refusal rules, the delete-before-create fix, and
   whether running it is safe against a project whose rows were set by hand.
4. Whether `.env.example` matches what `src/env.ts` and `src/env.public.ts`
   actually read, key for key.
5. `RESEND_AUDIENCE_ID` is empty in production, so `newsletter.service.ts` skips
   the contact creation with no log. Decide whether that guard should log.

Never print a secret value. Confirm by file, line, field name, length and at
most a three-character prefix.

## Log

- **2026-11-21** Written.
