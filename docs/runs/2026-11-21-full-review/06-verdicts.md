# 06: Verdicts

Fresh-context reviews of the artifacts produced by the 2026-11-21 full review.
One section per item, appended by the `sre` role. Each section states the
verdict, the claims re-run, and the conditions that must hold before anything
lands.

## Item 05: open pull request against the workspace repository

**Artifact:** `docs/runs/2026-11-21-full-review/05-review-open-pr-cloud-solutions-architect.md`
**Produced by:** `cloud-solutions-architect`
**Reviewed:** 2026-11-21, fresh context, artifact read in full before any producing rationale

### Verdict

```text
Verdict:      pass-with-conditions

Blast radius: workspace documentation and the agent-tier table ->
              docs/product-team.md:39-40 and agents/README.md:21 resolve tiers
              through AGENTS.md:15-18; hire-service/CLAUDE.md names
              ../ai-software-engineering/guidelines/ as its parent for prose,
              TypeScript and ADR conventions. No runtime code, no
              infrastructure, no deploy target.

Rule check:   hire-service/CLAUDE.md "Never accept a runtime vulnerability"
              (audit:runtime gates at --audit-level=info) -> holds in the
              working tree, violated at bd42a3d
              hire-service/CLAUDE.md "Run output: docs/runs/<date>-<slug>/"
              -> holds
              hire-service/CLAUDE.md "Already fixed" and "Known and accepted"
              tables -> absent from the file, absent from any file it names.
              The producer stated the absence and proposed first versions
              guidelines/writing-style.md:38 commit types
              (feat|fix|docs|chore|refactor|test|perf) -> violated at
              5de409b ("guidelines:") and f800767 ("templates+tools:")
              guidelines/writing-style.md:14 "say Claude for work Claude did"
              -> violated in all five commits, conditional on an unverifiable
              premise
              hire-service/CLAUDE.md forbidden patterns -> not reached by a
              markdown-only change

Risk added:   proposed diff 3 writes a false count into docs/product-team.md:7
              -> measured
              proposed diff 5 writes a stale measurement into
              hire-service/CLAUDE.md -> measured
              proposed diff 5 promotes a standing prohibition into
              "already fixed, do not re-report" -> measured
              proposed diff 5 carries a reopening condition the accepted state
              already satisfies -> measured from the text
              all five proposed diffs are corrupt as written -> measured
              closing PR #1 removes the only open review surface for three
              content findings -> suspected, and the producer already ordered
              the rollout to retire it

Disruption:   none. Nothing is deployed and nothing is provisioned. Closing
              PR #1 removes a review surface for a reviewer, not a service for
              a user, so no consumer, window or error signature applies

Rollback:     nothing was applied. Before commit: git checkout -- <file>.
              After commit: git revert <sha>, one markdown file per diff.
              Closing PR #1 is reversible by reopening it, because
              origin/feat/product-team-and-ai-inventory still carries cc05720

Conditions:   1. Do not apply proposed diff 3 until its replacement sentence
                 matches the file count measured in its own finding 4.
              2. Do not apply proposed diff 5 until the "Met 2026-11-21" stamp
                 is removed, the silent-catch row leaves the already-fixed
                 table, and the rate-limit reopening condition names an
                 observable.
              3. Regenerate every diff with git diff. All five fail
                 git apply --check today.
              4. Commit or stash the 74 uncommitted lines in
                 hire-service/CLAUDE.md before applying diff 5.
              5. Do not delete origin/feat/product-team-and-ai-inventory when
                 closing PR #1, or the rollback path above disappears.
              6. Fix the three content findings on feat/devops-agent-team
                 before closing, in the order the producer named.
```

### Refs established

| Repository | Branch | HEAD | Behind `origin/main` | Ahead | Dirty at review |
|---|---|---|---|---|---|
| `hire-service` | `main` | `bd42a3d` | 0 | 0 | 4 modified, 3 untracked |
| `ai-software-engineering` | `feat/devops-agent-team` | `7cbfc13` | 0 | 11 | 4 untracked |

The producer recorded 2 dirty files in `hire-service`. At review time there are
7: `CLAUDE.md`, `package.json`, `package-lock.json` and
`src/features/newsletter/newsletter.service.ts` modified, plus `docs/prompts/`,
`docs/runs/` and one untracked ADR draft. The growth is this run writing
artifacts and the concurrent `next` bump, not a producer error. The producer's
own correction of its brief (2 dirty, not 0) was right and is the reason its
`hire-service/CLAUDE.md` citations are traceable.

### Claims re-run

**1. All five added files are byte-identical on `feat/devops-agent-team`. Confirmed.**

```bash
git rev-parse cc05720:<path> and HEAD:<path> for each of the five
git diff --stat cc05720 HEAD -- <the five paths>   # empty
```

Every blob hash matches. `AGENTS.md` and `README.md` differ, both by additions
made on the devops branch. The claim is stronger than the producer stated:
`cc05720` is a literal ancestor of `7cbfc13`, not a cherry-pick, so the five
commits are the same objects on both branches. `git log --oneline main..` on
each branch shows the five as the base of the eleven. `git diff --shortstat`
confirms 7 files, +516/-3 exactly.

**2. Three roles have no agent definition in the base. Partly refuted, and this
is a field classified by its name rather than by its value.**

```bash
ls -1 /Users/andre/Work/hire-service/.claude/agents/   # 8 files
```

Eight files, as claimed. `security-reviewer`, `dependency-reviewer` and
`release-checker` match three of the seven roles by name, as claimed. The rest
of finding 4 is a filename comparison reported as an existence result:

- `arc42-keeper.md` is the Documentation keeper at `docs/product-team.md:32`
  by remit ("finding the sentences that became false after a change"). The
  producer left the seventh role unaccounted for rather than matching it.
- `theme-smith.md` and `capture-page-builder.md` cover the Interface curator's
  remit at `docs/product-team.md:33` by function, under different names.
- `paywall-guardian.md` and `rls-reviewer.md` have no row in
  `docs/product-team.md` at all, which is the other half of the mismatch and
  goes unreported.

By value, two roles have no counterpart by name or function: Product architect
at `:29` and Verification engineer at `:34`. Finding 4 should read 2 strict
absences, 1 function-only match, and 2 definitions with no row. This matters
because proposed diff 3 is built on the finding.

**3. `claude-haiku-4-5-20251001` is invalid and `claude-opus-4-8` is no longer
the top tier. Confirmed, and safe to act on. Do not downgrade it.**

Settled with the bundled `claude-api` skill, version 2.1.236. Two independent
facts, neither of which needs a live call:

- The skill carries a standing directive: "Use only the exact model ID strings
  from the table, they are complete as-is; never append date suffixes." The
  table lists `claude-haiku-4-5`. The date-suffixed form at `AGENTS.md:17` is
  invalid by the rule, not by a cached row.
- The table lists Claude Fable 5, Mythos 5 and Opus 5 above Opus 4.8, and the
  skill's standing default is `claude-opus-5`. This review runs on
  `claude-opus-5[1m]`, which is direct evidence the tier exists.

A live `GET /v1/models` is unreachable on this host: `ant` is not installed and
`ANTHROPIC_API_KEY` is unset. The producer labeled the top-tier half as
inferred from a cached table and was more conservative than the evidence
requires. Both halves are measured.

What the producer missed: nothing resolves that table programmatically. All 12
agent definitions across both repositories carry harness aliases in
frontmatter, not API ids.

```bash
for f in .claude/agents/*.md; do sed -n 's/^model: //p' "$f" | head -1; done
# opus, sonnet, opus, opus, sonnet, opus, opus, sonnet
```

So the invalid id has zero machine consumers. `docs/product-team.md:39-40` and
`agents/README.md:21` route tier *names* through the table, and the frontmatter
routes aliases. The blast radius is a human or agent copying the string into new
code, which is real but narrower than "the model-tier table both new documents
route through" implies.

**4. `tools/ai-inventory.sh` has forked, and the workspace copy is better.
Confirmed on the fork, mechanism refuted, and the judgement is narrower than
stated.**

```bash
diff tools/ai-inventory.sh /Users/andre/Work/hire-service/scripts/ai-inventory.sh
# 4 change blocks; diff -u merges them into 2 context hunks. 52 lines vs 43
```

Four divergent blocks, as claimed. The producer's mechanism is wrong on one
count: it says the `hire-service` copy "crashes on a missing directory". It does
not crash.

```bash
D=$(mktemp -d); cp /Users/andre/Work/hire-service/scripts/ai-inventory.sh "$D"/
cd "$D" && bash ./ai-inventory.sh; echo $?
# sed: .claude/agents/*.md: No such file or directory
#   *                        model=
# EXIT=0
```

It prints one error to stderr, emits a garbage row `* model=`, and exits 0.
A silent success with a wrong row is worse than a crash here, because
`hire-service/CLAUDE.md` instructs agents to run `npm run ai:inventory` before
editing `docs/ai-tooling.md` and to trust its output.

The workspace copy is better only on the `.claude/agents` guard. Run from
anywhere other than its real location, its `BASH_SOURCE` resolution reports 0
markdown files for all seven workspace subdirectories without an error, so the
second half of its output degrades silently too. The same class of defect, in a
different half of the script.

```bash
D=$(mktemp -d); cp /Users/andre/Work/ai-software-engineering/tools/ai-inventory.sh "$D"/
cd "$D" && bash ./ai-inventory.sh
#   (no .claude/agents in /var/folders/...)
#   prompts      0 markdown files   ... and six more zeros
```

One line more: run against `ai-software-engineering/agents/`, the same loop
emits a `README model=` row, because `README.md` matches the glob and has no
frontmatter.

**5. The five commits carry no Claude attribution. Confirmed on substance, with
one factual correction.**

```bash
git log -1 --format='A:%an <%ae>  C:%cn <%ce>%nBODY:[%b]%nTRAILERS:[%(trailers)]' <sha>
```

All five of `85cd5a0`, `1c18ee7`, `5de409b`, `f800767` and `cc05720` are
authored and committed by André Tonelli, with empty bodies and no trailers. No
`Co-Authored-By`. The producer wrote that the commits are "authored and
committed by `andrevst <andreveigatonelli@gmail.com>`". The git author name is
"André Tonelli"; `andrevst` is the GitHub handle. The handle is the right thing
to use when naming the pull request, which is what
`guidelines/writing-style.md:14` asks for, but it is not what git records, and
the artifact presents it as a git field value.

The rule itself cannot be checked from git. Whether Claude wrote the five
commits is an assertion in the prompt, not an observable in the repository, so
the `writing-style.md:14` violation is conditional on a premise this review
cannot verify. The producer hedged correctly with "if the premise is true".

**6. 158 `vite-plus` versions, 20 satisfy the range, the peer is optional.
Confirmed exactly.**

```bash
npm view vite-plus versions --json          # 158, latest 1.7.0
# semver.satisfies against '^0.1.15 || ^0.2.0' -> 20, from 0.1.15 to 0.2.9
npm view storybook@10.6.5 peerDependencies --json      # vite-plus: ^0.1.15 || ^0.2.0
npm view storybook@10.6.5 peerDependenciesMeta --json  # vite-plus: optional: true
```

`storybook@10.6.5` is installed and is a `devDependencies` entry, with 12 keys
in `dependencies`. The producer's evidence row says only that it is installed
and never calls it a production dependency, so the reject signal at
`guidelines/dependency-policy.md:76` is false for the reason stated. The
producer's correction of the brief (158, not 157) is right.

### Environment inflation: hunted, not found

The second named failure class does not appear in this artifact. Three checks:

- "Gated in CI" is a real gate, not a local script described as one.
  `.github/workflows/ci.yml:85` runs `npm audit --omit=dev --audit-level=info`,
  the same command as `npm run audit:runtime`.
- The producer states plainly that nothing is deployed and nothing is
  provisioned, and that PR #1 has no status checks to re-run.
- It labels the five `hire-service/CLAUDE.md` sections it cites as working-tree
  content absent from `bd42a3d`, rather than presenting them as committed.

The one state change under this review: `npm run audit:runtime` now exits 0,
"found 0 vulnerabilities", because `package.json` carries `next 16.4.6` in the
working tree. Finding 2 was true at `bd42a3d` and is retired in the working
tree. The producer measured it correctly against the ref it named.

### The six proposed edits

Nothing was applied, which is correct. All five diffs fail `git apply --check`
with "corrupt patch": every hunk header overstates its body. Diff 2 declares
`@@ -22,7 +22,8 @@` against a 3-line old body and a 4-line new body. Diff 5
carries a bare `@@` with no line numbers and is rejected as "No valid patches in
input". They read as illustrations, not as patches.

| Diff | Target | Content | Verdict |
|---|---|---|---|
| 1 | `guidelines/dependency-policy.md:76` | Replaces the false reject signal | Apply with a condition |
| 2 | `docs/base-architecture.md:24` | Separates the gate from the result | Safe to apply |
| 3 | `docs/product-team.md:7-9` | Restates what the roles are | **Block** |
| 4 | `AGENTS.md:15,17` | Corrects two model ids | Safe to apply |
| 5 | `hire-service/CLAUDE.md` | First version of the two tables | **Block** |
| 6 | the duplicated script | Not a diff, an open decision | Reasonable to leave open |

**Diff 3, blocked.** Its replacement sentence reads "Seven of the roles below
exist as agent definitions in that project." That is false by the artifact's own
finding 4, which asserts three of the seven have no definition anywhere, and
false by the measurement in claim 2 above, which finds at most four of seven
mapped and two with no counterpart at all. The diff fixes the "have done real
work" half of the false sentence and keeps the "seven exist" half, which is the
half finding 4 refuted. Condition to unblock: the sentence states a count that
matches `.claude/agents/`, or names the roles that have a definition instead of
counting them.

**Diff 5, blocked, on three separate counts.**

1. It writes "**Met 2026-11-21**" into `hire-service/CLAUDE.md`. That stamp is
   already stale: `npm run audit:runtime` exits 0 in the working tree. Writing
   a dated measurement into a reference document is the exact failure the
   artifact diagnoses two sections earlier, when it argues in diff 2 that "a
   measurement written into a reference document goes stale without anyone
   noticing, which is what happened". Condition: the row carries the reopening
   condition and nothing else.
2. It promotes "Four silent catch blocks hiding a misconfigured Sanity project"
   into "Already fixed, do not re-report". `hire-service/CLAUDE.md` keeps "No
   silent `catch`. Every one returns `err(...)`, logs, or rethrows" as a live
   forbidden pattern. A reviewer told not to re-report the class will not flag a
   newly introduced silent catch, which converts a standing prohibition into a
   suppression. The five rows lifted from
   `.claude/agents/security-reviewer.md:57-61` each name a specific historical
   defect; this sixth row names a class. Condition: the row leaves the table, or
   it names the four historical call sites by `file:line`.
3. Its reopening condition for per-instance rate limiting reads "A second
   instance serves the same list". More than one instance serving the same list
   is the accepted state, not a departure from it, so the row is accepted and
   reopened at the same time. Condition: the condition names something
   observable, such as a recorded abuse incident or a measured bypass.

The promotion of four security-scoped entries to repository scope is otherwise
correct, and the eighth-agent row is sourced accurately to
`docs/ai-tooling.md:12-15`. A fourth condition is mechanical: `CLAUDE.md`
carries 74 uncommitted added lines right now, so commit or stash before
applying anything to it.

**Diff 1, apply with a condition.** Deleting the false row is right. The
replacement row's trigger, "an install that crashes the package manager rather
than failing", is the only row in that table that cannot be evaluated before
installing. Every other signal at `guidelines/dependency-policy.md:70-75` reads
from registry metadata: an install script, a first-publish date, a maintainer
change, a name edit distance, a floating range, a transitive count. A reject
rule you can only test by running the thing you are deciding whether to run is a
different kind of rule, and the table does not say so. Condition: the row states
that it is a post-install signal, or the table gains that distinction.

**Diffs 2 and 4, safe in content.** Diff 2's reasoning holds whether or not the
gate is green today, and it survives the `next` bump: the architectural property
is the gate, and the sentence currently asserts a result. Diff 4's two
corrections are both verified above. Regenerate both with `git diff` before
applying.

### What the producer got right and should not be re-reviewed

- The recommendation. Option A, close as absorbed, with the three content
  findings fixed on `feat/devops-agent-team` first. The deciding criterion it
  names holds: `agents/README.md:7-10` cites `docs/product-team.md` as the
  parent of its organizing rule, and `agents/README.md:37-54` derives its
  one divergence from `docs/product-team.md:104`, so the five commits cannot be
  judged apart from the six that build on them. All four citations verified.
- Its refusal of the brief's supersession premise. `agents/README.md:7-10` names
  `docs/product-team.md` as the source it applies, which is the opposite of
  being superseded by it. Confirmed.
- Its boundary statement. `agents/README.md:42-50` does put technical shape with
  the architect and scope and delivery with the technical manager, so declining
  to merge or close is the correct read of the role.
- Its ref table, its correction of the dirty-file count, and its correction of
  the version count. All three were wrong in the brief and right in the artifact.
- Finding 7. `5de409b` uses `guidelines:` and `f800767` uses `templates+tools:`,
  neither of which is in the list at `guidelines/writing-style.md:38`, and
  `templates+tools` is not the `(<scope>)` syntax that line specifies either.
- Not applying anything, and asking for this review first.

### Conditions, restated as a checklist

1. Rewrite diff 3's sentence to match the measured file count, or name the roles.
2. Strip the "Met 2026-11-21" stamp from diff 5.
3. Move diff 5's silent-catch row out of the already-fixed table, or scope it to
   the four historical call sites.
4. Replace diff 5's rate-limit reopening condition with an observable.
5. Mark diff 1's replacement row as a post-install signal.
6. Regenerate all five diffs with `git diff`; none applies today.
7. Commit or stash `hire-service/CLAUDE.md` before applying diff 5.
8. Fix the three content findings on `feat/devops-agent-team` before closing
   PR #1, and keep `origin/feat/product-team-and-ai-inventory` so the close
   stays reversible.
9. Correct finding 4's count before it is quoted anywhere else.

### Log

- **2026-11-21** Reviewed on fresh context. 6 of 6 named claims re-run: 4
  confirmed, 2 confirmed with corrections. Both named failure classes hunted;
  one found (finding 4 classifies by filename, not by role), one absent.
  Verdict: pass-with-conditions, with diffs 3 and 5 blocked.


## Item 04: environment variable and secret topology

**Artifact:** `docs/runs/2026-11-21-full-review/04-env-and-secret-topology-devops-platform-engineer.md`
**Produced by:** `devops-platform-engineer`
**Reviewed:** 2026-11-21, fresh context, artifact and prompt read in full before any producing rationale

### Verdict

```text
Verdict:      pass-with-conditions

Blast radius: the code change lands in CLAUDE.md layer 4, public write
              endpoints -> POST /api/newsletter -> subscribe() ->
              sendWelcome() at src/features/newsletter/newsletter.service.ts:78.
              One consumer, one log line, no signature change.
              The artifact's *findings* describe layer 2 (src/env.ts,
              src/env.public.ts) and the live Vercel project
              sweai-base-apps, but the diff touches neither.

Rule check:   CLAUDE.md "SUPABASE_SECRET_KEY, STRIPE_SECRET_KEY,
              STRIPE_WEBHOOK_SECRET, RESEND_API_KEY and ADMIN_API_TOKEN must
              never appear in a NEXT_PUBLIC_ variable, a client component, or
              a log line" -> holds. The new line logs a variable name, not a
              value, and RESEND_AUDIENCE_ID is not on that list
              CLAUDE.md "No process.env outside src/env.ts, src/env.public.ts
              and the Sanity config files" -> holds in application code. The
              only other hits are a prose comment at src/proxy.ts:17 and
              assignments in src/env.unconfigured.test.ts, the test CLAUDE.md
              itself names as the guard for this behavior
              CLAUDE.md "No unlogged security event" -> the change moves
              toward this rule, not away from it
              CLAUDE.md "No pushing a committed placeholder to a deployed
              environment" -> holds for the 9 plain rows in sweai-base-apps,
              0 matches against the script's own placeholder regex.
              UNPROVABLE for the 7 encrypted rows, see below
              CLAUDE.md "Never accept a runtime vulnerability. audit:runtime
              gates on --audit-level=info. No triage step, no accepted-risk
              list" -> violated by the artifact's Finding 5 at
              04-env-and-secret-topology-devops-platform-engineer.md:125-135,
              which declines the gate and defers the bump. 7 advisories were
              in the --omit=dev tree at the ref it reviewed. Retired in the
              tree by 7f60bf9, which is not the producer's commit
              CLAUDE.md "Already fixed, do not re-report" and "Known and
              accepted" tables -> absent from CLAUDE.md and from every file
              it names. Stated here, first versions proposed below

Risk added:   by the code change: one logger.info per new subscriber while
              RESEND_AUDIENCE_ID stays empty -> suspected, log volume only.
              Retires the moment the variable is set
              by the artifact's Finding 1 remediation: running
              `npm run env:push -- --production` as recommended collapses
              NEXT_PUBLIC_SANITY_DATASET to .env.local's value, which is
              `development`, making the `production` Sanity dataset
              unreachable from every environment -> measured
              by the artifact's Finding 1 remediation: it does not collapse
              NEXT_PUBLIC_SITE_URL, so the duplicate it promises to fix
              survives -> measured
              pre-existing, not added here: Vercel production resolves
              NEXT_PUBLIC_SANITY_DATASET=development -> measured
              pre-existing, not added here: the preview target carries
              NEXT_PUBLIC_SITE_URL=http://localhost:3000 -> measured

Disruption:   none from the code change. A logger.info on a branch that
              already existed, no behavior change, no route affected, 122
              tests pass before and after

Rollback:     git revert c4fb824   (the change is now committed as
              "fix: log when the resend audience is unconfigured", one line,
              one file). Before it was committed:
              git checkout bd42a3d -- src/features/newsletter/newsletter.service.ts

Conditions:   1. Strike or amend the Finding 1 remediation. Do not run
                 `npm run env:push -- --production` until .env.local line 18
                 holds the dataset production should serve. It holds
                 `development` today
              2. Answer the architect's open question in
                 docs/adr/ADR-NNN-private-sanity-dataset-as-the-premium-content-gate.md
                 with the measured value: production resolves `development`
              3. Correct Finding 5. The gate is opt-in and did not fire from
                 `npm run build` as CI runs it, and audit:runtime would have
                 failed at bd42a3d on 7 advisories
              4. Record scan:secrets as unavailable, not as out of scope. The
                 gitleaks binary is not installed on this host
```

### Refs established

| When | Branch | HEAD | Behind `origin/main` | Ahead | Dirty |
|---|---|---|---|---|---|
| Corrected baseline at dispatch | `main` | `bd42a3d` | 0 | 0 | 2 |
| Measured at my review start | `main` | `bd42a3d` | 0 | 0 | 2 modified, 2 untracked |
| Measured at my review end | `main` | `41c4136` | 0 | 0 | 3 untracked |

The corrected baseline is accurate. The producer flagged the stage 0 record's
"0 dirty" as wrong, and it was.

HEAD moved during this review. Three commits landed, all stamped
`2026-11-21T02:32:42Z`:

```bash
git log -3 --format='%h %cI %s'
# 41c4136  docs: add the engagement contract the agent team reads
# c4fb824  fix: log when the resend audience is unconfigured
# 7f60bf9  fix: bump next to 16.4.6 for seven advisories
```

Two of the three matter to this item. `c4fb824` is the change under review, now
committed, which is why the rollback above names a revert. `7f60bf9` is the
Next.js bump that invalidates the artifact's Finding 5.

### Claims re-run, worst first

**1. Eight keys hold two overlapping rows, both targeting preview. Confirmed
exactly, and under-measured in the one field that matters.**

```bash
curl -sS "https://api.vercel.com/v9/projects/sweai-base-apps/env?decrypt=false" \
  -H "Authorization: Bearer $TOKEN"   # grouped by key, counted per target
```

25 rows, 17 distinct keys, 8 keys with 2 rows each. The 8 are exactly the 8 the
producer named. Every one of the 25 rows includes `preview` in its target list,
so `vercel env ls --environment=preview --project sweai-base-apps` returns all
25 and lists both rows for each duplicated key without disambiguating them. The
timestamps are right: the wide rows at 18:25 and the `development,preview` rows
at 20:34 on 2026-11-02.

The producer read every field of that response except the one that decides
whether the duplication is cosmetic. Comparing the two rows by SHA-256 of the
value:

| Key | Both rows equal | Row covering `production` | Row covering `development,preview` |
|---|---|---|---|
| `COFFEE_CURRENCY` | same | 3 bytes | 3 bytes |
| `COFFEE_UNIT_AMOUNT` | same | 3 bytes | 3 bytes |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | same | empty | empty |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same | 46 bytes | 46 bytes |
| `NEXT_PUBLIC_SUPABASE_URL` | same | 40 bytes | 40 bytes |
| `RESEND_FROM` | same | 27 bytes | 27 bytes |
| `NEXT_PUBLIC_SANITY_DATASET` | **different** | 11 bytes, `dev…` | 10 bytes, `pro…` |
| `NEXT_PUBLIC_SITE_URL` | **different** | empty | 21 bytes, `htt…` |

Six of eight duplicates carry identical values, so for those six the
non-determinism has no observable effect. Two diverge, and both are consequential.

**1a. Production resolves the Sanity `development` dataset. Measured, and it
answers a question another agent in this batch flagged as blocking.**

Tested by exact literal comparison, no value printed beyond a 3-character prefix:

```bash
# the only NEXT_PUBLIC_SANITY_DATASET row whose target includes production
npx vercel env ls --environment=production --project sweai-base-apps
#  NEXT_PUBLIC_SANITY_DATASET   development   Config   Production, Preview, Development
```

The two rows are not merely different, they are swapped. The row that covers
`production` holds `development`, and the row that covers `development,preview`
holds `production`. `docs/arc42/07-deployment-view.md:71` documents `production`
for every environment, so the documentation and the platform disagree.

The architect's untracked draft at
`docs/adr/ADR-NNN-private-sanity-dataset-as-the-premium-content-gate.md` carries
this as an open blocker: "**[NEEDS INPUT]**: Is `NEXT_PUBLIC_SANITY_DATASET` set
to `development` or `production` in the Vercel production environment". Item 04
held the answer in its own API response and did not read it.

Impact today is bounded, and I will not inflate it: that same ADR measures zero
`post` documents in either dataset on 2026-11-21, so production currently serves
no content from either. The defect becomes user-visible the moment a post is
published to the `production` dataset, because production will not read it.

**1b. The preview target carries `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
Measured.**

The `development,preview` row's value is byte-equal to the literal
`http://localhost:3000`, which is also `.env.local:1`. This is the exact value
`scripts/env-push.sh:122-126` exists to refuse. The row predates the refusal.

If Vercel resolves that row for a preview build, `src/env.public.ts:70` takes it
as `NEXT_PUBLIC_SITE_URL` and the whole fallback chain at lines 60 to 65 is
bypassed, so every magic-link callback, Stripe redirect, unsubscribe link and
sitemap entry on that preview points at `localhost:3000`. If the other row wins,
the value is empty and the chain produces the per-deployment host. Which one
wins is still not determinable from the API, and `vercel env ls` does not rank
them, so I reach the same limit the producer did and confirm it as a limit.
What measures it: one preview deployment, reading the resolved value at runtime.

**1c. The recommended remediation does not do what the artifact says. Refuted.**

The artifact states that re-running `npm run env:push -- --production` "would
resolve this, since `delete_existing` now clears both rows before creating one".
Tracing `scripts/env-push.sh` against the current `.env.local`:

- `NEXT_PUBLIC_SITE_URL` holds `http://localhost:3000`, so the localhost refusal
  at lines 122 to 126 hits `continue` **before** `delete_existing` is called at
  line 130. Both rows survive. The duplicate the remediation promises to fix is
  on the one key the script refuses to touch. The producer noted correctly that
  the refusals run before the delete, then drew the opposite conclusion about
  the outcome.
- `NEXT_PUBLIC_SANITY_DATASET` holds `development`, which is not a placeholder,
  so it is deleted and recreated once with `development` across all three
  targets. The run would propagate the wrong dataset to preview and development
  as well, and leave no row anywhere holding `production`.

So the recommendation, run as written, fixes 6 cosmetic duplicates, leaves the
consequential one, and makes the dataset inversion total. That is a risk the
artifact adds, which is why it is condition 1 rather than a note.

**2. `delete_existing` matches by key only, with no target filter. Confirmed,
and the stated failure is reachable.**

`scripts/env-push.sh:77-89` greps the full project env list for
`"key":"$KEY"` and deletes every id it finds, with no reference to `$TARGETS`.
Line 130 calls it unconditionally before the single create at line 132. The
producer's reasoning is sound.

One piece of evidence strengthens it beyond what the artifact claims. The
producer sourced the hazard to the script's own header at lines 16 to 18. The
project's own stated next step triggers it. `CLAUDE.md`, "Environments and
promotion order": "Preview and production share one environment variable row for
every secret, so a live key cannot reach production without also reaching
preview. **Split those rows before any live credential is set.**" Splitting a row
by hand is precisely what a later plain `./scripts/env-push.sh` run silently
collapses. The artifact frames this as a hypothetical operator mistake. It is the
documented instruction.

Measured today: all 7 encrypted rows target `production,preview,development`
together, so no split exists yet and nothing has been collapsed. The producer's
read of the history is right.

**3. `RESEND_AUDIENCE_ID` is empty in production. Confirmed, by length, without
decrypting anything.**

One row, target `Production, Preview, Development`, `type: plain`, value length
0. Because the row is `plain`, the API returns the stored value verbatim and the
length is the real length, so this needs no `decrypt=true` at all. `src/env.ts:61`
trims it, `src/env.ts:106` omits the key from the parsed object, and the field is
`.optional()` at line 53, so no fallback is recorded and `unconfiguredServerVars`
never names it. Every claim in Finding 3 holds.

The added line is correct and in the right place. `git diff` confirms the whole
change is 2 added lines at `src/features/newsletter/newsletter.service.ts:81-83`,
inside the existing `if`/`else`, logging the variable name only.

**4. `.env.example` matches `env.ts` and `env.public.ts` 17 for 17. Confirmed.**

Re-derived independently, by parsing `.env.example` for keys and both modules for
`process.env.*` references and schema fields:

```text
.env.example keys        : 17
code-read, operator-set  : 17
code-read, system-set    : NODE_ENV, NEXT_PUBLIC_VERCEL_ENV,
                           NEXT_PUBLIC_VERCEL_URL,
                           NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
in .env.example but NOT read by code : none
read by code but NOT in .env.example : none
```

The four system variables are correctly absent from `.env.example`. The
producer's note that `SANITY_API_READ_TOKEN` and `RESEND_AUDIENCE_ID` are absent
from `.env.local` is also confirmed, and harmless for the reason given.

**5. Every secret in `src/env.ts` falls back to random bytes, never a fixed
string. Confirmed, each one checked.**

`randomSecret()` at `src/env.ts:22` is `randomBytes(24).toString("base64url")`,
32 characters per call.

| Variable | Line | Fallback | Satisfies its own schema |
|---|---|---|---|
| `SUPABASE_SECRET_KEY` | 70-74 | `sb_secret_` + random | prefix refine at 40 |
| `STRIPE_SECRET_KEY` | 75-79 | `sk_test_` + random | `startsWith("sk_")` at 44 |
| `RESEND_API_KEY` | 80-84 | `re_` + random | `startsWith("re_")` at 51 |
| `STRIPE_WEBHOOK_SECRET` | 93-97 | `whsec_` + random | `startsWith("whsec_")` at 45 |
| `ADMIN_API_TOKEN` | 98 | random, 32 chars | `min(16)` at 55 |
| `NEWSLETTER_SECRET` | 99-103 | random twice, 64 chars | `min(32)` at 57 |

No path to a fixed string for any of the six. `RESEND_FROM` at lines 85 to 89
falls back to the fixed `unconfigured@example.invalid`, and the producer is right
that this is correct for a non-credential: `scripts/env-push.sh:64-70` also
classifies it as plain, not secret, so code and script agree.

**6. The site URL fallback is correct per Vercel's first-party documentation.
Confirmed, with one documented note the producer missed.**

Fetched `vercel.com/docs/environment-variables/system-environment-variables`,
last updated 2026-07-15. `VERCEL_PROJECT_PRODUCTION_URL` exists and means what
`src/env.public.ts:58-62` assumes: "A production domain name of the project. We
select the shortest production custom domain, or vercel.app domain if no custom
domain is available. Note, that this is always set, even in preview deployments
... The value does not include the protocol scheme https://." The code prepends
`https://` at line 62, which the doc requires. `autoExposeSystemEnvs` is `true`
on the live project, confirmed via `GET /v9/projects/sweai-base-apps`, so the
`NEXT_PUBLIC_` copies the code reads are populated. The producer is right that
this is a load-bearing project setting rather than a given.

The same page carries a note on the other half of the chain that the artifact
does not mention: "`VERCEL_URL` ... **This variable cannot be used in conjunction
with Standard Deployment Protection.**" The project runs
`ssoProtection.deploymentType: all_except_custom_domains`, which is Standard
Protection, and `src/env.public.ts:63-64` uses `NEXT_PUBLIC_VERCEL_URL` as the
preview fallback. Finding 4 calls this "expected for a preview environment and
not a regression", with no change proposed. The vendor documents the variable as
unusable in this configuration. The conclusion to leave it alone may still be
right for a preview-only path, but it should rest on that sentence rather than
around it.

**Finding 4's production claim is refuted.** The artifact says the per-deployment
host "sits behind the same SSO wall as production did before this fallback chain
existed", implying production is now reachable because the chain changed. Measured:

```bash
curl -I https://sweai-base-apps.vercel.app/      # HTTP 200, no redirect
```

The project has exactly 1 domain, `sweai-base-apps.vercel.app`, verified and
targeting production. Production answers an anonymous request with 200 today.
Separately, `docs/arc42/07-deployment-view.md:71` lists the production URL as
"Custom domain", and no custom domain exists. Minor documentation drift, same row
as the dataset error.

### The named failure classes

**A field classified by its name rather than its value. Present as a trap, and
the producer did not fall into it.**

All 7 encrypted rows in `sweai-base-apps` return a value prefixed `eyJ` with
lengths clustered at 964, 964, 964, 964, 1076, 1100 and 1168. That is Vercel's
ciphertext envelope, `{"v":"v2","c":…}` base64, not the credential. `?decrypt=true`
did not decrypt them with this token. A reader going by prefix would conclude
that `SUPABASE_SECRET_KEY` holds a legacy `eyJ` service-role JWT, which
`src/env.ts:40` explicitly accepts, and that `ADMIN_API_TOKEN` holds a JWT too.
Neither inference is supportable. The producer made no claim about those values
and labeled them "(encrypted)" by type, which is the correct limit.

The consequence for the rule check: `CLAUDE.md`'s "No pushing a committed
placeholder to a deployed environment" is verifiable for the 9 plain rows, where
the script's own regex `placeholder|replace_me|unconfigured|\bREPLACE\b` matches
0 of them, and **unprovable from here for the 7 encrypted rows**. The artifact
asserts the refusal rules "are correct and match CLAUDE.md's rule" on the
strength of reading the script, which is a code claim, not a state claim. Those
are different claims and only the first is established.

**An environment inflated. Found, in the opposite direction, and not by the
producer.**

Production is not described as larger than it is. It is pointed at a
nonproduction resource: the `development` Sanity dataset, per claim 1a. An
environment deflated rather than inflated, and the artifact's key-coverage table
lists that key as "yes, 2 rows" without reading either value.

### Verification re-run

| Gate | Producer's claim | My result |
|---|---|---|
| `npm run typecheck` | types generated, no errors | confirmed |
| `npm run lint` | clean | confirmed, no output |
| `npm run test` | 16 files, 122 tests | **confirmed exactly**, 16 passed, 122 passed, 7.66s |
| `npm run build` | failed once, passed on retry | **refuted as described**, passed on my first invocation, exit 0 |
| `npm run audit:runtime` | not run, declared out of scope | **run**, 0 vulnerabilities now, 7 advisories at `bd42a3d` |
| `npm run scan:secrets` | not run, declared out of scope | **unavailable**, gitleaks not installed. Recorded unverified |

**Why the build failed once, rather than accepting "succeeded on retry".**

The producer's explanation is that the gate "blocks once to surface the advisory,
then lets the build proceed", called the documented behavior. The mechanism is
real. `node_modules/next/dist/lib/upgrade/nudge.js` defines
`allowNudgeRetry`, which hashes `project\0version\0command\0kind`, writes a
receipt to `<distDir>/cache/next-agentic-upgrade-retries/<sha256>.json` and
returns `false` on first call, then returns `true` when a retry finds a receipt
newer than `RETRY_TTL = 5 * 60 * 1000`. Block once, allow within five minutes.
That much is confirmed from source.

Two things the explanation gets wrong.

First, the gate is opt-in. `assessUpgrade` returns `null` immediately unless the
policy is `security`, `latest` or `experimental-future`, read from
`config.experimental.agentUpgrade` or the `__NEXT_AGENT_UPGRADE` environment
variable. `next.config.ts` sets no `agentUpgrade` and no `experimental` block,
and `__NEXT_AGENT_UPGRADE` is unset in a plain shell. So `SecurityFatalError`
cannot fire from `npm run build` as this project or CI runs it. It fired because
the producer's own agent harness set that variable. Finding 5 presents a
harness artifact as a property of the build command.

Second, and this is the part that matters: the advisory was real and the project
has a rule about it. Auditing the pre-bump lockfile directly,

```bash
git show bd42a3d:package-lock.json > /tmp/old/package-lock.json
cd /tmp/old && npm audit --omit=dev --audit-level=info --package-lock-only
```

returns **seven** advisories against `next 16.0.0 - 16.4.4`: `GHSA-mfr8-8qww-v76h`,
`GHSA-vc7v-qv4w-wrv8`, `GHSA-7qx7-33qx-rqx2`, `GHSA-f3mh-rxg3-f5g2`,
`GHSA-pc58-hwjq-p385`, `GHSA-rhh4-g77r-r9qj`, `GHSA-vvgp-ww4w-46vf`. So
`npm run audit:runtime` would have failed at the ref the producer reviewed.
`CLAUDE.md` is unambiguous: "Never accept a runtime vulnerability ... No triage
step, no accepted-risk list." The artifact declined to run that gate, declared
the advisory out of scope, and deferred the bump to "a tracked item for whoever
next bumps Next.js". That is the rule violation recorded in the verdict.

It is already retired in the tree, by `7f60bf9` "fix: bump next to 16.4.6 for
seven advisories", which is not the producer's commit. `npm run audit:runtime`
now reports 0 vulnerabilities, `next` is 16.4.6, and my builds pass first try
because `assessUpgrade` has nothing to nudge about. I cannot reproduce the
producer's failure, and the reason I cannot is that someone else fixed it.

Route counts differ trivially and are not a finding: the artifact says 25 routes,
23 dynamic, 2 static. The build prints 24 rows, 22 dynamic and 2 static, plus a
`Proxy (Middleware)` row, with static generation reporting 25/25 pages.

### The two tables are absent

`CLAUDE.md` has no "Already fixed, do not re-report" table and no "Known and
accepted" table, and no file it names carries them. Item 05's review reports the
same absence, and the producer of item 05 proposed first versions. Proposed
additions from this item's findings only, to be merged with those rather than
duplicated:

**Already fixed, do not re-report**

| Finding | Fixed by | Regression check |
|---|---|---|
| Two overlapping rows per key after a plain run and a `--production` run | `delete_existing`, `scripts/env-push.sh:77-89`, commit `aff54bc` | More than one row for any key in `GET /v9/projects/sweai-base-apps/env`. Eight keys still carry two, predating the fix |
| A committed placeholder pushed to a deployed environment | the refusals at `scripts/env-push.sh:117-126` | A live row matching `placeholder\|replace_me\|unconfigured\|\bREPLACE\b`. 0 of 9 plain rows match |
| An unlogged skip of the Resend audience add | `c4fb824` | The `else` at `src/features/newsletter/newsletter.service.ts:81` losing its `logger.info` |
| `next` 16.4.3 carrying seven runtime advisories | `7f60bf9` | `npm run audit:runtime` exiting non-zero |

**Known and accepted**

| State | Why accepted | Reopening condition |
|---|---|---|
| One environment variable row spans production, preview and development for all 7 secrets | `CLAUDE.md`, "Environments and promotion order". No live credential is set yet | Any live credential set on this project. `CLAUDE.md` already requires splitting the rows first |
| Preview deployments sit behind Standard Deployment Protection, so `NEXT_PUBLIC_VERCEL_URL` links are unreachable anonymously | Preview is not customer-facing | A preview deployment needs to receive an anonymous callback, such as a Stripe webhook or a magic-link click |
| `SANITY_API_READ_TOKEN` is declared and read by no code path | It is the recorded hook for ADR-NNN Option A | Option A activates, which is the first published premium post |
| `RESEND_AUDIENCE_ID` is empty, so no subscriber reaches the Resend audience | Study base, the list is not in use | The Resend audience becomes the system of record for subscribers. The skip is now logged, so this is observable |

### What the producer got right and should not be re-reviewed

- The one-line change. Correct placement, correct level, logs the name and not
  the value, mirrors the `logger.info` two lines above it. 122 tests pass.
- The decision not to run the script. It writes to a live project, and the
  prompt and the session are read-only on anything networked.
- The eight duplicated keys, their target sets and their timestamps. Exact.
- `delete_existing` matching by key only, and the refusals running before it.
- `.env.example` at 17 for 17.
- Every secret falling back to random bytes, and `RESEND_FROM` correctly excluded
  from that set.
- `VERCEL_PROJECT_PRODUCTION_URL` checked against the first-party reference
  rather than the code comment, as the prompt required, and
  `autoExposeSystemEnvs` named as load-bearing.
- Its correction of the stage 0 dirty-file record.
- Its three explicit "could not reach" entries. All three are genuine limits,
  and I hit the same wall on preview row resolution.

### Log

- **2026-11-21** Reviewed on fresh context. 6 of 6 named claims re-run: 4
  confirmed, 1 confirmed and under-measured in a consequential field, 1
  confirmed with a missing vendor note. Verification re-run: `verify` confirmed
  exactly, `build` refuted as described, `audit:runtime` run for the first time,
  `scan:secrets` unavailable. Both named failure classes hunted; the
  name-over-value trap found and avoided by the producer, an environment
  deflation found and missed by it. Verdict: pass-with-conditions on `c4fb824`,
  with four conditions on the artifact's recommendations.

## Item 02: paywall boundary for a public content dataset

**Artifact:** `docs/runs/2026-11-21-full-review/02-sanity-dataset-paywall-cloud-solutions-architect.md`
**Draft decision:** `docs/adr/ADR-NNN-private-sanity-dataset-as-the-premium-content-gate.md`
**Produced by:** `cloud-solutions-architect`
**Reviewed:** 2026-11-21, fresh context, both documents read in full before any producing rationale

### Verdict

```text
Verdict:      pass-with-conditions

Blast radius: Sanity project ugtw0nl6, shared -> hire-service blog routes
              (src/lib/sanity.ts:12, src/features/posts/posts.queries.ts) and
              the arqui.dev property, whose 5 offerList documents live in the
              same project's production dataset. The artifact changes no source
              file, so today's radius is two untracked documents
Rule check:   "No process.env outside src/env.ts, src/env.public.ts and the
              Sanity config files" -> holds
              "No silent catch" -> holds, src/app/(site)/blog/page.tsx:56 logs
              "REPLACE in .env.example means the operator fills it in, not an
              error" -> holds, the finding is that nothing reads the variable,
              not that the value is wrong
              "Add a new credential to config-check's configured map" ->
              violated by ADR action item 5, which defers it to Option A, while
              CLAUDE.md requires it unconditionally. Already satisfied,
              uncommitted, at src/shared/config-check.ts:30
              "Decisions in docs/adr/, MADR, numbers assigned at merge" ->
              holds, file is ADR-NNN, Status Proposed
              "docs/arc42/ belongs to arc42-keeper" -> holds, rows drafted and
              not applied
              No secret value printed -> holds, pattern scan of both documents
              returned nothing
Risk added:   Option A's rollout order -> measured against first-party docs. A
              private dataset answers an unauthenticated read with HTTP 200 and
              an empty result, so flipping visibility before the token deploys
              blanks the blog. The ADR names this and orders the rollout
              correctly
              Trigger with no evaluator -> measured. No CI step, no runtime
              assertion, and none of the 8 agents in .claude/agents mentions
              "dataset" or "visibility". src/app/(site)/coffee/page.tsx:32
              already counts premium posts at request time, so the quantity is
              computed in the running app and alarmed on by nothing
              Option A loses the content CDN cache -> measured against the page
              the ADR itself cites: the global CDN layer does not cache private
              datasets. Runtime impact suspected only, because revalidate: 60
              and tags: ["post"] at posts.queries.ts absorb most reads
              Net direction: down. The datasets were already public and
              ADR-005:23 already carried the premise. This change deletes a
              false mitigation claim and adds no new exposure
Disruption:   none from the artifact. Two untracked documents, no source file
              touched, no write reached Sanity
              Named for the eventual Option A rollout: every /blog and
              /blog/[slug] route on sweai-base-apps plus every preview returns
              HTTP 200 with the "No posts yet" state at
              src/app/(site)/blog/page.tsx:68-85, for every reader, from the
              visibility flip until the token deploy completes. Basis is
              Sanity's documented 200-empty behavior; no deploy duration was
              measured
Rollback:     git clean -f docs/adr/ADR-NNN-private-sanity-dataset-as-the-premium-content-gate.md
              docs/runs/2026-11-21-full-review/02-sanity-dataset-paywall-cloud-solutions-architect.md
              For Option A later: npx sanity datasets visibility set <dataset> public
Conditions:   8 below, all checkable
```

### Refs

| Repository | Branch | HEAD read by the producer | HEAD now | Distance | Dirty now |
|------------|--------|---------------------------|----------|----------|-----------|
| `hire-service` | `main` | `bd42a3d` | `41c4136` | 3 commits ahead of what the producer read | 1 modified (`src/shared/config-check.ts`), 3 untracked |
| `ai-software-engineering` | `feat/devops-agent-team` | `7cbfc13` | `7cbfc13` | 11 ahead of `origin/main` | 4, untracked only |

The three commits the producer did not see are `7f60bf9` (next 16.4.6),
`c4fb824` (Resend audience logger) and `41c4136` (engagement contract). None
touches `src/lib/sanity.ts`, `src/features/posts/**`, `src/env.ts`,
`.env.example` or `docs/arc42/`, so no cited line moved. Every `file:line` in
the artifact was re-resolved against `41c4136` and all but one resolve exactly.

`src/shared/config-check.ts` is modified in the working tree by the
orchestrator, concurrent with the run. Claim 5 was judged against `HEAD`, as
instructed, and the working-tree version was then read separately.

### Reviewer-memory tables

Still absent. `grep -n -i "already fixed\|known and accepted\|do not re-report" CLAUDE.md`
returns nothing. The producer proposed first versions of both and they were
read before any finding here was formed. Nothing below re-raises a row from its
proposed "Known and accepted" table.

### Claims re-run, worst first

**1. Project identity, membership, CORS and the foreign document type. Confirmed, one trim.**

```
$ npx sanity projects list
ugtw0nl6  2 members  arqui.dev   https://www.sanity.io/manage/project/ugtw0nl6  2024-07-15
8j1hgjyn  2 members  espaco-resiliencia  ...  2024-06-07

$ npx sanity cors list
http://localhost:3333
http://localhost:3000
https://669a8b4c9dd1e06580104dcd--arquidev.netlify.app
https://arqui.dev

$ curl -s ".../data/query/production?query=*[]._type"
{"result":["offerList","offerList","offerList","offerList","offerList"]}

$ grep -rn "offerList" --exclude-dir=node_modules .   ->  nothing outside this run's own output
```

Name, member count, creation date, all four CORS origins and the five
`offerList` documents are confirmed exactly. `sanity/schema/post.ts:3` declares
`post` and `sanity/schema/` declares nothing else, so `offerList` is foreign by
value and not only by name. The conclusion holds: a plan or visibility change on
`ugtw0nl6` is a change to another property's infrastructure.

Two refinements. The account holds a second project, `8j1hgjyn`
`espaco-resiliencia`; the artifact's quoted output shows one row where the
command returns two. Harmless, since `.env.local:17` pins `ugtw0nl6`, but the
output was trimmed without saying so. And the coupling is not entirely
undocumented: `.env.example:37` and `src/env.public.ts:36` both name
`https://arqui-dev.sanity.studio` as the example Studio address. That is a hint,
not a record, so the ADR's action item still earns its place.

**2. A private dataset returns 200 and empty, and both datasets are public. Confirmed.**

First-party, [Sanity, Datasets](https://www.sanity.io/docs/content-lake/datasets):
"Unauthenticated requests to a private dataset return an HTTP 200 with an empty
response in the requested shape, not a 401." The same page puts private datasets
on the Growth plan.

```
$ npx sanity datasets visibility get development   -> public
$ npx sanity datasets visibility get production    -> public
$ curl -s -o /dev/null -w "%{http_code}" ".../data/query/development?query=*[]._type"   -> 200
$ curl -s ".../data/query/development?query=*[]._type"   -> {"result":[]}
$ curl -s ".../data/query/<both>?query=count(*[_type==\"post\"])"   -> 0 and 0
```

The producer's central methodological point stands: against an empty dataset the
brief's probe cannot separate public-and-empty from private, and only the CLI
settles it.

One fact the producer missed and the ADR should carry, from the same page: after
a downgrade, "Datasets that were made public during the downgrade stay public
until you set them back to private yourself." So the Free-plan reversion is not
only silent, it does not self-heal on re-upgrade. That strengthens the ADR's own
argument for Option C's place in the record.

**3. ADR-005:23-24 already documents the public-dataset premise. Confirmed.**

`grep -n "public-read" docs/adr/ADR-005-paywall-enforced-in-the-groq-query.md`
returns line 23: "Sanity's dataset is public-read, so the query itself must not
be the only / secret." It sits under "## Decision drivers" at line 18. The
producer's reading is right: the premise is a driver, and none of the four
controls in Consequences acts on it. "Correct and incomplete" is the accurate
classification, and the prompt's third framing is the one the ADR itself refutes.

**4. Drafts are out of anonymous reach because of the dot in `_id`. Confirmed verbatim.**

First-party, [Sanity, Keeping your data safe](https://www.sanity.io/docs/content-lake/keeping-your-data-safe):
"An unauthenticated request to a public dataset can only read documents whose
`_id` contains no dot, which excludes every draft (`drafts.<documentId>`) and
every release version (`versions.<releaseId>.<documentId>`)". The
`!(_id in path("drafts.**"))` filter at `src/features/posts/posts.queries.ts:19`
and `:26` is editorial correctness and was never a control, so the "Current
mitigation" half of the risk row at
`docs/arc42/11-risks-and-technical-debt.md:32` is wrong on both halves as the
producer states.

**5. `SANITY_API_READ_TOKEN` declared, documented, unread, and unmapped. Confirmed against HEAD, one citation error.**

Against `41c4136`: `src/env.ts:49` is `z.string().min(1).optional()`, read at
`:60` and conditionally merged at `:105`. `.env.example:35` is
`SANITY_API_READ_TOKEN=REPLACE`. `grep -rn "SANITY" src/ sanity/ sanity.config.ts sanity.cli.ts`
finds no consumer of `env.SANITY_API_READ_TOKEN`. `git show HEAD:src/shared/config-check.ts`
lists nine variables at lines 21 to 29 and not this one. Every part confirmed.

The failure mode is confirmed and worse than written. The producer says a
placeholder token would "render the empty state at `src/app/(site)/blog/page.tsx:64`".
Line 64 is the catch-path alert. A 200-empty read does not throw, so `loadFailed`
stays false and the page renders lines 68 to 85: "No posts yet. Create one in the
Sanity Studio, then deploy it with npx sanity deploy." A misconfigured token
produces a message that blames empty content and names the wrong fix.

The orchestrator's uncommitted edit adds the variable at
`src/shared/config-check.ts:30` as `env.SANITY_API_READ_TOKEN ?? ""`. Re-run:
`npx vitest run src/shared/config-check.test.ts --project node` passes, 5 of 5.
An unset value is the empty string, which `looksPlaceholder` at line 17 does not
match, so no new report fires today; `REPLACE` does match, which is the intent.
The edit is correct. It also makes ADR action item 5 stale before merge.

**6. $30 a month at two seats, Growth, $15 a seat. Confirmed on the rate, wrong on the count.**

[Sanity pricing](https://www.sanity.io/pricing), read 2026-11-21: Free is $0 with
2 public-only datasets, Growth is "$15 per seat / month" with 2 datasets and
private visibility, Enterprise is custom.

Two corrections, both to the ADR's comparison table.

The seat count is classified by member count, not by role. The same page states
"A seat is consumed by all user types except the ones with the Viewer role,
which are free." The project has 2 members and the producer's own unreachable
list says the second member's role is unknown. So the figure is at most $30 and
is $15 if that member is a Viewer. This is the named failure class, a field
classified by its label rather than its value, found in the cost row.

Option B's cost is wrong by $999 a month. Growth includes 2 datasets and
additional datasets are "$999 per dataset (Add-On)". The project already has
`production` and `development`, so a third private dataset for premium bodies
costs $1,029 a month unless `development` is retired, which is the dataset
`.env.local:18` points local development at. The ADR prices B at $30, equal to
A, and dismisses B on that basis. The correction strengthens the dismissal, so no
decision changes, but the number is quoted and wrong.

### Findings the producer missed

Worst first.

**1. Option A loses the content CDN cache, against the page the ADR cites.**
[Sanity API CDN](https://www.sanity.io/docs/content-lake/api-cdn) says both
"Authenticated requests are cached. Caching is segmented for each unique
authentication token" and that the global CDN layer "does not cache private
datasets or POST queries". The ADR quotes only the first and concludes
`useCdn: true` "stays correct". It stays functional, not cached. Measured against
the source; the runtime cost is suspected only, because
`src/features/posts/posts.queries.ts` reads with `revalidate: 60` and
`tags: ["post"]`, so Next's own cache absorbs most requests.

**2. Assets stay public in a private dataset, and premium bodies can hold them.**
The same "Keeping your data safe" page: "Assets stored in a dataset are public on
the asset CDN, even when the dataset is private... Anyone who has the URL can
still fetch the file." `sanity/schema/post.ts:40` defines `body` as
`[{ type: "block" }, { type: "image" }]`, so a premium body can embed images.
Under Option A the body text is protected and its embedded assets are protected
by obscurity only. This belongs in Option A's Cons. It cuts the other way too,
and should be said: Option A does not break cover images, because
`src/lib/sanity.ts:21` builds browser-side asset URLs that keep working without
a credential.

**3. The trigger has no evaluator.** Measured. `.claude/agents/` holds eight
definitions and none mentions "dataset" or "visibility", `release-checker.md`
included. No `package.json` script and no CI step queries the Content Lake. The
ADR's Consequences admits this; what it does not do is name an owner. The check
is cheap, and that it is cheap is a fact, not a design: the unauthenticated query
`count(*[_type=="post" && isPremium == true])` returns 0 against both datasets
today, with no credential.

**4. Environment inflation, in the direction the brief warned about.** The
artifact's prose calls `development` "the dataset the application actually uses"
while its own table marks the Vercel value "Not reached". Both cannot stand.
`.env.local:18` is the only measured evidence and it covers local only. It also
matters which way the unknown falls: `src/env.public.ts:34` defaults
`NEXT_PUBLIC_SANITY_DATASET` to `"production"`, asserted at
`src/env.unconfigured.test.ts:103`, so an unset Vercel row puts the live blog on
the dataset holding `arqui.dev`'s five `offerList` documents and zero posts. The
ADR's `[NEEDS INPUT]` is right to be there; the run artifact's prose should match
it.

**5. ADR action item 5 contradicts a standing rule and is already done.**
CLAUDE.md: "Add a new credential to its `configured` map or a setup mistake in it
will surface as a bare provider error instead." That is unconditional. The action
item defers it to Option A's activation. The orchestrator has already made the
change at `src/shared/config-check.ts:30` in the working tree.

**6. `sanity.config.ts:5-13` describes a Studio that does not exist here.** Its
comment reads "Studio is served from the app itself at `/studio`. One deploy
ships the site and the editor", with `basePath: "/studio"`. There is no `/studio`
route under `src/app`, CLAUDE.md says the Studio is published separately and is
"not a route on this domain", and ADR-006 hosts it. Out of this item's scope and
recorded here because the Option A rollout touches the Studio's access path.

**7. Suspected, not measured: the hosted Studio may never have been deployed.**
`npx sanity cors list` shows no `*.sanity.studio` origin and
`.env.local:20` leaves `NEXT_PUBLIC_SANITY_STUDIO_URL` empty with the comment
"Set after `npx sanity deploy`". That is consistent with an undeployed Studio,
which would mean the trigger cannot fire until someone deploys one. Not
confirmed: whether `sanity deploy` registers its own CORS origin was not
established, and the Vercel value was not read. The operator can close it at
`sanity.io/manage/project/ugtw0nl6`.

### Judgement on the recommendation

Option D now with Option A as the committed successor is safe, and it is the
right call rather than merely a defensible one. Measured: zero `post` documents
in either dataset, so there is nothing to protect today, and the one thing
currently wrong is a documentation row claiming a mitigation that does not
exist. Correcting that row costs nothing and is the whole of the urgent work.
Buying Growth today would spend money to change the plan and dataset visibility
of a project that serves `arqui.dev`, in order to protect content that does not
exist. Net risk moves down.

The rollout ordering, token before visibility, is correct and is now backed by
the first-party sentence rather than by inference. One addition: because
CLAUDE.md records that preview and production share one environment variable row
per secret, the token reaches preview in the same step, which is harmless for a
read token and means the flip does not have to be staged twice.

The gap is the trigger. "The first post published with `isPremium` true" is
observable in principle and observed by nobody: no CI step, no runtime
assertion, and no agent definition. I do not block on it. The exposure predates
this change, ADR-005:23 already carried the premise, and blocking would freeze a
correction that strictly improves the record. It becomes condition 1 instead.

### Conditions

1. Name who or what evaluates the trigger. An owner in the ADR, or a check in
   `.claude/agents/release-checker.md` or CI. The quantity is already readable
   without a credential and reads 0 today.
2. Correct Option B's cost row for the Growth plan's 2-dataset allowance and the
   $999 add-on, or state that `development` is retired as part of B.
3. Change "$30" to "at most $30, and $15 if the second member of `ugtw0nl6`
   holds the Viewer role", or confirm the role at `sanity.io/manage`.
4. Add to Option A's Cons that assets stay public on the asset CDN even in a
   private dataset, and that `sanity/schema/post.ts:40` permits image blocks in
   `body`. Add to its Pros that browser-side asset URLs keep working.
5. Correct the Option A pro about the CDN: the cited page says the global CDN
   layer does not cache private datasets.
6. Strike action item 5 as done at `src/shared/config-check.ts:30`, or commit
   that change before this ADR merges. Either way, drop the framing that defers
   it, which contradicts CLAUDE.md.
7. Correct the empty-state citation from `src/app/(site)/blog/page.tsx:64` to
   `:68-85`, and record that the message names the wrong fix.
8. Reconcile the run artifact's prose with its own "Not reached" row on the
   Vercel dataset value, and note that `src/env.public.ts:34` defaults to
   `production` when the row is unset.

None of the eight changes the decision. Conditions 1, 2, 3 and 6 are the ones
that change what a reader would do.

### Log

- **2026-11-21** Reviewed on fresh context at `41c4136`, 3 commits ahead of the
  `bd42a3d` the producer read; no cited line moved. 6 of 6 named claims re-run:
  4 confirmed, 2 confirmed with corrections. Both named failure classes hunted
  and both found: the $30 seat figure classifies by member count rather than by
  role, and the artifact's prose promotes `development` from a local value to
  the running system's while its own table marks that unreached. No write
  reached Sanity, Vercel or any dashboard; no mutation was sent; no secret value
  is printed. Verdict: pass-with-conditions.

## Item 01: documented architecture against the code

**Artifact:** `docs/runs/2026-11-21-full-review/01-architecture-vs-code-cloud-solutions-architect.md`
**Produced by:** `cloud-solutions-architect`
**Reviewed:** 2026-11-21, fresh context, artifact read in full before any producing rationale

### Verdict

```text
Verdict:      pass-with-conditions

Blast radius: project records that future changes are checked against ->
              .claude/agents/security-reviewer.md:40 (invariant 3),
              .claude/agents/paywall-guardian.md:24 (check 5) and
              CLAUDE.md:154 (forbidden pattern) all resolve the service-role
              call-site count through the texts F1 corrects;
              ADR-002, ADR-004, ADR-005, ADR-006 and ADR-008 carry the
              statements F8, F9 and the re-decision rewrite;
              docs/arc42/02,04,05,06,07,11,12 carry the rest.
              Two proposed edits leave documentation:
              src/lib/supabase/admin.ts is a CLAUDE.md layer-2 file
              ("secrets and headers", ask before changing), and proposal 9
              adds a Chromium a11y test to npm run test.
              No infrastructure, no deploy target, no schema.

Rule check:   CLAUDE.md "Never accept a runtime vulnerability"
              (audit:runtime gates at --audit-level=info) -> holds at
              41c4136, measured 0 findings exit 0 in a clean --omit=dev tree
              CLAUDE.md "No supabaseAdmin in a page, a component, or a route
              handler that has not already verified its caller" -> holds.
              Measured: grep -rn supabaseAdmin src/app src/components returns
              nothing. Only the trailing sentence "Today there are two
              legitimate call sites" is false, at CLAUDE.md:154
              CLAUDE.md "No next-sanity, and no sanity or @sanity/vision in
              dependencies" -> holds in the repository. The probe that
              measures the re-decision ran in a throwaway directory and
              touched no manifest here. Option A of the re-decision would
              contradict this line, see condition 5
              CLAUDE.md "No new dependency without a row in
              docs/dependencies.md" -> violated at docs/dependencies.md:27.
              The separator row and the next row share one 270-character
              line with 10 pipes, so the Production table has no valid
              delimiter row and does not render as a table at all
              CLAUDE.md "No process.env outside src/env.ts, src/env.public.ts
              and the Sanity config files" -> holds. The only non-exempt hits
              are src/env.unconfigured.test.ts, which sets the variables the
              rule protects in order to test them, and a comment at
              src/proxy.ts:17 stating that it does not read process.env
              CLAUDE.md "Commit messages, under 60 characters, lowercase
              after the type, subject only" -> holds for all 9 drafted
              subjects. Longest is 56 characters
              CLAUDE.md "Ask before changing anything in layers 1 to 3"
              -> not satisfied by proposal 1, see condition 1

Risk added:   proposal 9's story for src/components/post-body.tsx enters
              npm run test as a Chromium test with @storybook/addon-a11y at
              error -> suspected. If post-body.tsx carries an existing
              accessibility violation the story turns the verify job red for
              every open pull request. Not measured here: the working tree
              carries four other agents' edits, so a pass or a fail could
              not be attributed
              the artifact's own headline states a live credential path that
              the environment does not have -> measured. docs/product/
              roadmap.md:17-18 records supabase/schema.sql unapplied and
              SUPABASE_SECRET_KEY unset. The artifact discloses both in its
              limitations table and not in the headline or the F1 diagram
              correcting 5 of 7 locations leaves 2 carrying the false count
              -> measured, see claim 2
              no risk in this artifact lacks a retirement condition

Disruption:   none from the artifact as written. It changes no code and
              nothing is deployed. The one disruption a proposal could cause
              is named above and is gated by condition 6

Rollback:     nothing was applied; the artifact is a review document. Before
              commit: git checkout -- <file>. After commit: git revert <sha>,
              one markdown file per proposal, which is why proposal 9 must
              not share a commit with proposals 1 to 8. The ADR-006
              re-decision reverts as one commit over docs/adr/ADR-006,
              docs/adr/ADR-008 and CLAUDE.md

Conditions:   1. Get the operator's go-ahead before editing
                 src/lib/supabase/admin.ts. CLAUDE.md puts it in layer 2 and
                 says to ask, and a comment-only edit is still an edit to a
                 layer-2 file
              2. Correct the service-role count in 7 locations, not 5. Add
                 CLAUDE.md:154 and .claude/agents/paywall-guardian.md:24
              3. Fix three line citations before anyone follows them:
                 security-reviewer.md invariant 3 is at :40, not :46; its
                 auth/callback row is at :27, not :28; its already-fixed and
                 known-and-accepted tables start at :53 and :63, not :62 and
                 :72
              4. Drop src/features/newsletter/unsubscribe.ts from F4's
                 absent-module table or restate the row. The component view
                 draws features/* at directory granularity and
                 Component(newsletter, "features/newsletter") covers that
                 file. The other 4 rows hold
              5. The ADR-006 commit amends CLAUDE.md's "No next-sanity"
                 forbidden pattern in the same commit, or that line and
                 Option A's measured gate contradict each other
              6. Proposal 9 lands in its own commit, after
                 npm run test passes on a clean tree with the new story
              7. Restate F1's headline in the environment the repository is
                 in: the code path exists, the credential is unset and the
                 tables are unapplied. The finding is a false invariant, not
                 a live exposure, which is what the finding body already says
```

### Refs established

| Repository | Branch | HEAD | vs `origin/main` | Dirty at review |
|---|---|---|---|---|
| `hire-service` | `main` | `41c4136` | no `origin/HEAD` configured; 0 ahead of the reviewed commit's lineage | 4 modified, 4 untracked |

The producer measured at `bd42a3d`. `HEAD` is `41c4136`, 3 commits ahead
(`7f60bf9`, `c4fb824`, `41c4136`). `git diff --stat bd42a3d..HEAD` touches four
files: `CLAUDE.md`, `package.json`, `package-lock.json` and
`src/features/newsletter/newsletter.service.ts`. The producer's ref record names
exactly those four and states the drift itself, which is the reason its
citations stayed traceable.

Four measurements of my own, and the drift the dispatch asked for:

```text
$ git status --porcelain
 M .github/workflows/ci.yml
 M package.json
 M scripts/ai-inventory.sh
 M src/shared/config-check.ts        # not in the dispatch's list
?? .nvmrc
?? docs/adr/ADR-NNN-private-sanity-dataset-as-the-premium-content-gate.md
?? docs/prompts/
?? docs/runs/
```

Two differences from the dispatch record. `src/shared/config-check.ts` is
modified and no item claimed it, and the ADR-NNN draft is untracked and belongs
to item 02. Neither changes a finding below: `config-check.ts` is cited by F4
only as a module missing from a diagram, and that is a claim about the diagram.

`.claude/agents/security-reviewer.md` is byte-identical at `bd42a3d` and `HEAD`
(`git diff bd42a3d..HEAD -- .claude/agents/security-reviewer.md` is empty), so
the three wrong line numbers in condition 3 are mis-citations, not drift.

### Reviewer-memory tables

Both exist, both read before forming any finding, contrary to item 05's record
in this same file.

| Table | Where | Entries | Used |
|---|---|---|---|
| Already fixed, do not re-report | `.claude/agents/security-reviewer.md:53-61` | 5 | none re-reported |
| Known and accepted | `.claude/agents/security-reviewer.md:63-71` | 4 | none re-raised, no reopening condition met |
| Deliberate shortcuts / Risks / Known gaps | `docs/arc42/11-risks-and-technical-debt.md:6,22,41` | 3 sections | F11 touches the third |

Item 05's verdict block in this file records both tables as "absent from the
file, absent from any file it names". Measured, they are present at the lines
above, and `CLAUDE.md` names the file as "the `security-reviewer` agent
definition in `.claude/agents/`". The producer of item 01 is right and item 05
is wrong on this point. The likely cause is the named failure class: item 05
looked for a file named by path and this one is named by agent name.

### Claims re-run, worst first

**1. ADR-006's probe. Confirmed, and reproduced independently.**

I ran the probe twice, once per side, with one counting method applied to both,
because the artifact's `78` and `803` came from methods it described differently.
Both installs used npm 10.9.3 on Node v22.18.0.

```bash
# baseline: HEAD's own manifest and lockfile, clean directory
git show HEAD:package.json > $B/package.json
git show HEAD:package-lock.json > $B/package-lock.json
npm ci --omit=dev          # exit 0

# probe: next@^16.4.6, react/react-dom 19.3.0, next-sanity@^13.5.1,
#        @sanity/client@^8.14.1, then npm install, rm -rf node_modules, npm ci --omit=dev
```

| Metric, same method both sides | HEAD today | with `next-sanity` | Artifact |
|---|---|---|---|
| Top-level entries under `node_modules`, scopes expanded | 86 | 815 | 78 / 803 |
| Directories holding a `package.json` with a `name` | 240 | 1120 | not given |
| Distinct package names at any depth | 226 | 951 | not given |
| `npm audit --omit=dev --audit-level=info` | 0 findings, exit 0 | **16 (14 moderate, 2 high)** | 0 / 16 (14 moderate, 2 high) |
| `node_modules/sanity` | absent | present | same |
| `node_modules/styled-components` | absent | present | same |
| `node_modules/@vercel/frameworks` | absent | present | same |

The advisory figure reproduces exactly: 16 findings, 14 moderate, 2 high. The
two high roots are `js-yaml` (5 advisories) and `smol-toml` (3); the moderate
root is `minimatch` through `@oclif/core`. The chain is
`@vercel/frameworks -> @sanity/cli -> sanity`, so `sanity` arrives as a
non-optional peer that npm installs into the production tree, which is the
mechanism the artifact claims. Measured, not inferred.

The package counts differ by about 10 percent from the artifact's, in the same
direction on both sides: 86 to 815 is 9.5x, the artifact's 78 to 803 is 10.3x.
The gap is counting method, not drift. `docs/dependencies.md:16` records that
`ls node_modules | wc -l` counts 61 empty `@scope` directories, and my method
expands scopes into individual packages instead. The conclusion does not move.

One correction to the artifact's reading of the condition. `ADR-006:84-86` is:

```text
Option B becomes correct again if `next-sanity` ever moves `sanity` to a peer
or optional dependency, which would let the Studio be embedded without the CLI
tree.
```

The outcome test is already in that sentence. Measured, the CLI tree comes back
(`@sanity/cli`, `@sanity/cli-build`, `@sanity/cli-core`, `@sanity/runtime-cli`
and `@sanity/workbench-cli` are all in the probe's `--omit=dev` tree), so the
subordinate clause is false and the condition is **not met** on a careful
reading. The artifact's "met in letter and not in effect" is right; its
diagnosis that "the condition named a manifest field when it meant a measured
outcome" is half right. The condition named both. The defect is that the
operative half reads as an explanation, so a reader stops at the comma. That
makes the rewrite more worth doing, not less.

**2. Four importing modules, and the claim appears in seven places, not five. Confirmed with a correction.**

```bash
$ grep -rln 'supabaseAdmin' src/ | sort
src/features/leads/leads.service.ts
src/features/newsletter/newsletter.service.ts
src/features/newsletter/subscribe.test.ts
src/features/newsletter/unsubscribe.test.ts
src/features/newsletter/unsubscribe.ts
src/features/payments/entitlements.service.ts
src/lib/supabase/admin.ts
```

Four non-test importing modules plus the defining module and two test files.
The artifact's count is right. Its line number for
`src/features/newsletter/newsletter.service.ts` moved from 121 to 123 at
`41c4136` and the artifact gives both.

The two anonymous paths are real and traced by value, not by name.
`src/app/api/newsletter/route.ts:23` does call `getCurrentUser()`, and line 24
uses it only for `ownsAddress`, which line 26 passes as `allowResubscribe`.
Nothing gates the admin client. `src/app/api/leads/route.ts` has a rate limit at
line 9 and a Zod parse at line 14 and no caller verification at all.

The location count is wrong in the safe direction. Measured, seven places carry
it:

| Where | Text | In the artifact |
|---|---|---|
| `src/lib/supabase/admin.ts:6-9` | "the Stripe webhook ... and the newsletter sender" | yes |
| `docs/adr/ADR-002-rls-as-the-authorization-layer.md:83` | "by exactly two paths" | yes |
| `docs/arc42/08-crosscutting-concepts.md:27` | "in exactly two call paths" | yes |
| `docs/arc42/12-glossary.md:16` | "two signature or token verified paths only" | yes |
| `.claude/agents/security-reviewer.md:40` | invariant 3, "Two call sites today" | yes, cited as :46 |
| `CLAUDE.md:154` | forbidden pattern, "Today there are two legitimate call sites" | **no** |
| `.claude/agents/paywall-guardian.md:24` | check 5, "imported by exactly two paths" | **no** |

```bash
$ grep -n "two legitimate call sites\|exactly two\|two call sites\|two signature" \
    CLAUDE.md docs/adr/*.md docs/arc42/*.md .claude/agents/*.md src/lib/supabase/admin.ts
```

Fixing five of seven is the failure mode the artifact itself warns about: "Fix
all five locations in one commit, or the next reviewer will re-derive this."
Condition 2.

The forbidden-pattern rule itself holds. `grep -rn supabaseAdmin src/app
src/components` returns nothing, so no page, component or route handler imports
the admin client. Only the count sentence is false. The artifact reports the
invariant as false without making that distinction, which overstates it: a rule
whose prohibition holds and whose example count is stale is a stale example, not
a broken rule.

**3. Node 26 as Active LTS. Confirmed from the first-party source, with two date corrections.**

```bash
$ curl -sS https://raw.githubusercontent.com/nodejs/Release/main/schedule.json
v22 {"start":"2024-04-24","lts":"2024-10-29","maintenance":"2025-10-21","end":"2027-04-30","codename":"Jod"}
v24 {"start":"2025-05-06","lts":"2025-10-28","maintenance":"2026-10-20","end":"2028-04-30","codename":"Krypton"}
v26 {"start":"2026-05-05","lts":"2026-10-28","maintenance":"2027-10-20","end":"2029-04-30","codename":"Lithium"}
```

Node 26 "Lithium" entered LTS 2026-10-28 and enters maintenance 2027-10-20, so
on 2026-11-21 it is **Active** LTS, EOL 2029-04-30. Confirmed.

Two corrections to the artifact. It dates the LTS transition 2026-11-10;
`schedule.json` says 2026-10-28. It says v22 "is still LTS on the same table",
which is true and incomplete: v22 entered maintenance 2025-10-21 and ends
**2027-04-30**, 17 months out, against 26's 29 months. The artifact's
"No support-horizon objection is raised here" is correct about 26 and
understates the case against staying on 22. Item 03's artifact has all four
dates right.

**4. The five count claims. All five confirmed.**

```bash
$ grep -c "^create policy" supabase/schema.sql
4
$ grep -n "^create policy" supabase/schema.sql
26:  profiles: read own    30:  profiles: update own
79:  subscribers: read own 126: entitlements: read own
$ awk '/\{/{b++;c=0} /--[a-z-]+:/{c++} /^\}/{print "block "b": "c" tokens"}' src/app/themes.css
block 1: 16 tokens ... block 5: 16 tokens
$ find src/app -name route.ts | wc -l
8
$ grep -o 'UC-[0-9][0-9]' docs/use-cases.md | sort -u | wc -l
14
$ awk 'NR==27{print "LEN="length($0); print "PIPES="gsub(/\|/,"|")}' docs/dependencies.md
LEN=270
PIPES=10
```

| Claim | Where | Documented | Measured |
|---|---|---|---|
| policies | `ADR-002:79`, `security-reviewer.md:30` | five | **4** |
| theme tokens per block | `ADR-004:76` | eleven | **16** in all 5 blocks. `docs/arc42/08-crosscutting-concepts.md:102` already says 16 |
| route handlers | `docs/arc42/04-solution-strategy.md:7` | six | **8** |
| use cases | `docs/product/README.md:39` | 13 | **14**. `docs/use-cases.md:3` already says "Fourteen" |
| `next` row renders | `docs/dependencies.md:27` | n/a | malformed |

F10 understates its own blast radius. GFM requires the delimiter row to be the
second line of the table. Line 27 is the delimiter row with the `next` row
appended to it, so it is not a valid delimiter, so line 26 is not a table
header, so the **entire Production dependency table** renders as a paragraph,
not just the `next` row. 14 rows, not 1. That makes CLAUDE.md's "a dependency
without a row is a review failure" true of every production dependency, on one
formatting defect.

**5. The story claim and the stale-teaching claim. Both confirmed.**

```bash
$ find src -name '*.stories.tsx' | wc -l
8
$ ls src/components/*.tsx | grep -v stories
coffee-button.tsx email-capture.tsx nav.tsx not-found-content.tsx paywall.tsx post-body.tsx site-menu.tsx
```

Of the 7 components directly under `src/components/`, 5 have a sibling story and
`nav.tsx` and `post-body.tsx` have none. `docs/arc42/05-building-block-view.md:105`
says "Every component has a story under `src/**/*.stories.tsx`". False, and
`post-body.tsx` is the component where it matters: it is the Portable Text
renderer and the only `safeHref` call site in a component. The three client
components under `src/app/(site)/` the artifact names (`login/login-form.tsx`,
`themes/theme-card.tsx`, `unsubscribe/unsubscribe-confirm.tsx`) also have none;
`cart/cart-client.tsx` does. Confirmed.

The stale-teaching claim holds on all four rows:

| Where | Still teaches | Code |
|---|---|---|
| `docs/arc42/06-runtime-view.md:119` | "accept `next` only if it starts with "/"" | `src/app/auth/callback/route.ts:10-12` calls `safeNextPath`, with a comment naming the prefix check as insufficient. `src/shared/safe-url.ts:43-47` rejects `//`, `/\` and control characters |
| `.claude/agents/security-reviewer.md:27` | same rule | same |
| `docs/arc42/06-runtime-view.md:102` | "200 with the matching message" | `src/app/api/newsletter/route.ts:34` returns one message for every outcome |
| `docs/arc42/07-deployment-view.md:100-103` | falls back to `NEXT_PUBLIC_VERCEL_URL` | `src/env.public.ts:60-65` prefers `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` when `NEXT_PUBLIC_VERCEL_ENV === "production"` |

`src/shared/safe-url.ts:34` carries the reason this matters: "`value.startsWith("/")`
is not enough and three call sites used it anyway". Two documents still teach
the rule that comment exists to retire.

**6. F4's absent-module table. Four of five rows confirmed, one refuted.**

The level 3 view at `docs/arc42/05-building-block-view.md:50-85` names 12
components. The only `src/shared/` module drawn is `Component(http,
"shared/http", "parseBody + json")`, so `safe-url.ts`, `escape-html.ts`,
`config-check.ts` and `logger.ts` are genuinely absent and no component covers
their remit under another name. I checked each candidate by what it owns, not by
its label: `libs` is `lib/*` clients, `env` is config, `http` is parse and json.
Four rows hold.

The fifth does not. `src/features/newsletter/unsubscribe.ts` sits inside
`Component(newsletter, "features/newsletter", "schema + service")`, and the view
draws `features/*` at directory granularity. The module is inside a component
that is on the diagram. The honest version of that row is that the component's
description says "schema + service" and omits the HMAC trust boundary, which is
a labeling defect, not an absence. This is the named failure class, classifying
by name rather than by what the thing covers, and it is the one place in this
artifact it occurs.

The rest of F4 holds. The level 2 diagram at line 15 lists 6 of 8 handlers and
omits `POST /api/newsletter/unsubscribe` and `POST /auth/signout`. The view has
no `Rel(pages, libs)` edge and the code has 19 such imports across 8 pages. It
has no `Rel(pages, newsletter)` edge and
`src/app/(site)/profile/page.tsx:7` imports `unsubscribeUrl` from
`@/features/newsletter/unsubscribe`. F5 holds too:
`profile/page.tsx:15-16,23-27` creates a Supabase server client and queries
`newsletter_subscribers` in the page body, which the section 5 Responsibilities
row at line 117 forbids and the section 4 prose at line 35 permits.

### Environment inflation: hunted, and found in the headline only

The artifact's limitations table is unusually careful. It marks the Vercel
projects, the production Node runtime, the Postgres major, the Sanity dataset
and the Stripe event list as unreached, and it states that
`supabase/schema.sql` has not been applied, citing `docs/product/roadmap.md`
item 0.1.

The headline does not carry that care. Its second deciding paragraph opens
"**The service-role key reaches Supabase from two unauthenticated entry
points.**" Measured, `docs/product/roadmap.md:17-18` records
`supabase/schema.sql` unapplied and `SUPABASE_SECRET_KEY` unset, and notes
"Writes answer 503 without it even with 0.1 done". CLAUDE.md's own policy is
that unset secrets get random bytes at boot and fail closed. So no key reaches
Supabase today from any entry point. The F1 diagram repeats the promotion:
`PG[("Postgres, RLS on 4 tables, 4 policies")]` draws schema state that exists
in a `.sql` file and in no running project.

The finding body is honest about this ("This is not a new vulnerability and this
review does not claim one", "What to change: the documentation, not the code"),
so this is a presentation defect, not a fabrication. Condition 7 restates the
headline rather than removing the finding.

### Node 26: the decision the producer deferred

Safe for this repository. Conditions on CI, not on the version.

Measured:

- Node 26 is Active LTS with 29 months of horizon; Node 22 is in maintenance
  with 17 (`schedule.json`, claim 3).
- Of 697 installed packages declaring `engines.node`, **0** exclude Node 26.
  Checked `next` (`>=20.9.0`), `vitest`
  (`^22.12.0 || ^24.0.0 || >=26.0.0`), `playwright` (`>=20`), `eslint`,
  `typescript`, `@supabase/supabase-js` (`>=22.0.0`) and `stripe` individually.
- `engines.node: "26.x"` against local v22.18.0 produces
  `npm warn EBADENGINE` and `npm ci --dry-run` exits **0**. There is no
  `.npmrc` and no `engine-strict` anywhere in the repository, so the pin warns
  and does not block local work.
- Node 26 is **not installed on this machine**. `~/.nvm/versions/node` tops out
  at v22.18.0, and `node --version` is v22.18.0. Nothing in this repository has
  executed on Node 26 anywhere reachable from here. CI is the first execution,
  as the dispatch states.

Unprovable from here, and the reason this is a condition rather than a pass:
whether Vercel's build image offers 26.x. Narrowing `engines.node` from
`>=22.0.0` to `26.x` takes away Vercel's freedom to choose, which is the point
of the change and also its only failure mode. Item 03 asserts Vercel already
deploys 26; this role is unauthenticated against the dashboard and did not
confirm it.

The decision turns on blast radius, and the blast radius is small. If 26.x is
not on Vercel's list, the build fails with an invalid-Node-version error, and it
fails on a preview deployment first, because every pull request builds a preview
from the same `engines` field before `main` does. What stops: the Vercel build
for one pull request. Who notices: the engineer who opened it. For how long: one
revert of two lines. No production deployment and no running endpoint is
affected, because a failed build does not replace a running deployment.

So the artifact's framing is right that this is a governance failure rather than
a wrong version. I would sharpen it: it is also an **untested** version, which
is a smaller and different risk than a wrong one, and the cure is to let CI be
the gate it already is rather than to hold the change.

The process finding stands. `docs/arc42/02-constraints.md:11` still says
"Node 22 LTS", and the file's own preamble says those rows "are not decisions,
and the ADRs in section 9 do not revisit them".
`docs/arc42/05-building-block-view.md:15` and
`docs/arc42/07-deployment-view.md:21` still say "Node 22". All three confirmed
by grep. The constraint changed without an amendment, which is a documentation
defect in three files, not a platform risk.

### The ADR-006 re-decision: accepted, with three corrections

Accept Option A. The deciding criterion the artifact names, the exit path, is
the right one, and the measurement supports it: the manifest-shaped trigger
fired while the outcome it was proxying moved the wrong way, from 0 advisories
to 16 with 2 high, and `sanity` and `styled-components` back in the production
tree. Option B would have the project bet again on a vendor's packaging, and the
first such bet is the one that just failed.

Should the condition be rewritten as a measured outcome rather than a manifest
shape? **Yes.** That is the whole lesson of the measurement. Three corrections
to how the artifact gets there.

1. **The premise is half wrong.** `ADR-006:84-86` already contains the outcome
   test, in the clause "which would let the Studio be embedded without the CLI
   tree". Measured, the CLI tree returns, so the condition is not met. The fix
   is to promote that clause from explanation to the operative test, which is a
   smaller and more defensible edit than replacing a condition that "was wrong".
2. **Option A contradicts a CLAUDE.md forbidden pattern and the artifact's
   rollout note misses it.** CLAUDE.md's "No `next-sanity`, and no `sanity` or
   `@sanity/vision` in `dependencies`" is absolute and names ADR-006 as its
   reason. A measured gate that says "embedding is allowed when the audit stays
   at 0" gives that line an escape it does not have. The artifact's rollout note
   correctly pairs ADR-006 with ADR-008; it must also carry CLAUDE.md, or the
   next reader follows whichever document they open first. Condition 5.
3. **The worry about the gate having no runner is misplaced.** The artifact
   frets that the check attaches to the `release-checker` agent, "which
   `docs/ai-tooling.md` records as never executed". Option A's check is a
   pre-condition on a future proposal, not a recurring job. It runs once, when
   somebody proposes embedding the Studio. What it needs is a named owner at
   that moment, not a scheduler. Stated that way the cost is lower than the
   artifact claims and Option A gets stronger.

The re-decision's reversal condition as drafted ("`npm` stops installing
non-optional peers by default, or `next-sanity` marks `sanity` optional in
`peerDependenciesMeta`") is checkable and correct. I confirmed the second half
is false today: `npm view next-sanity peerDependenciesMeta` is empty and
`npm ci --omit=dev` put `sanity` in the tree.

Rollback for the re-decision: one `git revert` over three markdown files. No
platform state changes.

### Verification re-run

| The producer's claim | Re-run | Result |
|---|---|---|
| `npm run audit:runtime` exits 0 at `41c4136` | clean `npm ci --omit=dev` from `HEAD`'s manifest and lockfile in a throwaway directory, then `npm audit --omit=dev --audit-level=info` | **exit 0, "found 0 vulnerabilities"**. Confirmed, and stronger than the producer's: mine ran against a tree with no other agent's edits in it |
| 16 advisories with `next-sanity` added | full probe, claim 1 | **confirmed exactly**: 16, 14 moderate, 2 high |
| `npm run verify` and `npm run build` not attributable | not run | **unverified, deliberately**. Four files are dirty from three other items and Node 26 is not installed here, so a result could be attributed neither to `41c4136` nor to the Node change. CI on 26 is the measurement that settles it |

### What the producer got right and should not be re-reviewed

The ADR-006 probe, independently reproduced to the advisory. All five counts in
F8 and F10. The four stale-teaching rows in F7. The story gap in F6, including
the judgment that `post-body.tsx` is the one that matters and `nav.tsx` has a
real technical reason. F5's contradiction between section 4 and section 5, with
the code satisfying one and violating the other. The four importing modules and
both anonymous paths in F1. The eight-row ADR table, including the four
reversal conditions it checked and found not met. The ref record, which named
its own drift and the uncommitted `CLAUDE.md` it was reading as a fact source.
The limitations table, which marks five provider surfaces unreached rather than
guessing at them.

### Log

- **2026-11-21** Reviewed on fresh context at `41c4136`, 3 commits ahead of the
  `bd42a3d` the producer read. Artifact read in full before any producing
  rationale. 5 of 5 dispatched claim groups re-run: claim 1 confirmed by an
  independent two-sided npm probe, claim 2 confirmed and extended from 5
  locations to 7, claim 3 confirmed from `nodejs/Release schedule.json` with
  two date corrections, claim 4 confirmed on all five counts with F10's blast
  radius widened from 1 row to a 14-row table, claim 5 confirmed on the story
  gap and all four stale-teaching rows, with one of F4's five absent-module
  rows refuted. Both named failure classes hunted and both found: F4 classifies
  `unsubscribe.ts` by file name where the diagram draws directories, and the
  artifact's headline promotes an unapplied schema and an unset key into a live
  credential path that its own limitations table marks unreached. Node 26
  judged safe, with the Vercel build image as the single unprovable. ADR-006
  re-decision accepted as Option A with three corrections. No file was changed
  except this one; the npm probe ran in a throwaway directory and touched no
  manifest in this repository; no secret value is printed. Verdict:
  pass-with-conditions.
