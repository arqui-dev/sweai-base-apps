# 02: Sanity dataset paywall boundary

**Agent:** `cloud-solutions-architect`
**Prompt:** `docs/prompts/02-sanity-dataset-paywall.md`
**Date:** 2026-11-21
**Verdict:** The finding holds. ADR-005 is correct and incomplete, not wrong. The draft sits at
`docs/adr/ADR-NNN-private-sanity-dataset-as-the-premium-content-gate.md`, Status `Proposed`,
unnumbered and unapproved. The SRE reviews it.

---

## Repository refs

Measured at the start of this run, for every repository read.

| Repository | Branch | HEAD | Ahead of `origin/main` | Behind | Dirty |
|------------|--------|------|------------------------|--------|-------|
| `hire-service` | `main` | `bd42a3d` | 0 | 0 | 2 |
| `ai-software-engineering` | `feat/devops-agent-team` | `7cbfc13` | 11 | not measured, no upstream distance reported | 4, untracked only |

The brief recorded `hire-service` as 0 dirty. It is 2: ` M CLAUDE.md` and `?? docs/prompts/`.
Neither is under `src/` and neither changes a measurement in this review. No third repository was
opened.

## Framework lens

**CNCF cloud native patterns**, for the portable layer, with **no cloud well-architected lens
applied**. Hire Service runs on Vercel, Supabase, Stripe, Sanity and Resend. None of those is
AWS, Google Cloud or Azure, so none of those three frameworks' pillar names apply here and
borrowing one would be the error the role definition forbids. The CNCF patterns that carry weight
in this review are **least privilege** and **declarative config**, and the pillar content below
comes from Sanity's own documentation, resolved in this session and cited inline.

The finding is a least-privilege finding: the application reads content with no credential at
all, so the Content Lake cannot distinguish the application from anyone else.

## Reviewer memory

`CLAUDE.md` has **neither** of the two tables the role requires: there is no
`Already fixed, do not re-report` table and no `Known and accepted` table, and no file is named
as holding them. Proposed first versions are in the last section of this artifact.

The memory supplied with this run was honored. `paywall-guardian` invariants 1 to 6 were verified
holding on 2026-11-11 and are not re-reported. The GROQ gate, `assertNoLeak`, and `hasPremium`
routing through the user session client were all re-read in passing and all still read as
described at `src/features/posts/posts.queries.ts:28`, `src/features/posts/posts.gate.ts:11` and
`src/features/payments/entitlements.service.ts:45`. No regression, so no finding.

---

## Part 1: What exists, as measured

Every claim here is a command and its output, or a `file:line`.

### Dataset visibility, resolved authoritatively

```
$ npx sanity datasets list
production
development

$ npx sanity datasets visibility get development
public

$ npx sanity datasets visibility get production
public
```

Both datasets on project `ugtw0nl6` are public. This is the authoritative resolution of the
prompt's central question, and it is the first-party CLI command Sanity documents for the purpose.

### The evidence in the brief does not establish the brief's conclusion

The brief's verified evidence was an anonymous query returning HTTP 200 with zero posts, read as
"the dataset is readable without a token". Sanity documents the opposite reading as equally
consistent:

> Unauthenticated requests to private datasets return "HTTP 200 with an empty response" rather
> than a 401 error.
> Source: [Sanity, Datasets](https://www.sanity.io/docs/content-lake/datasets)

HTTP 200 plus an empty result is exactly what a **private** dataset returns to an unauthenticated
caller. Against `development`, which holds zero documents of any type, the probe in the brief
cannot distinguish public-and-empty from private. Reproduced:

```
$ curl -s ".../data/query/development?query=*{_type,_id}"
{"query":"*{_type,_id}","result":[],"syncTags":["s1:+JLjsQ"],"ms":3}
```

Two independent probes do establish the conclusion for `production`, and the CLI establishes it
for both:

```
$ curl -s ".../data/query/production?query=*{_type,_id}"
{"result":[{"_id":"1034bb43-...","_type":"offerList"}, ... 5 documents ...]}
```

Five documents returned to a request carrying no credential is positive proof that `production`
is public-read. The conclusion in the brief is correct. The stated basis for it was not, and a
reviewer who re-ran only the brief's command would have learned nothing about `development`,
which is the dataset the application actually uses.

### The content client carries no credential

`src/lib/sanity.ts:12-17` constructs the only content client:

```ts
export const sanityClient = createClient({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01",
  useCdn: true,
});
```

No `token` field. `src/env.public.ts:85-89` inlines `NEXT_PUBLIC_SANITY_PROJECT_ID` into the
client bundle, which is correct for a `NEXT_PUBLIC_` variable and means the project id is not a
secret. The gate at `src/features/posts/posts.queries.ts:28` therefore governs the application's
own response and no other request to the same dataset.

### `SANITY_API_READ_TOKEN` is declared, documented, and unread

Measured. Three references exist and none of them is a consumer:

| Location | What it does |
|----------|--------------|
| `src/env.ts:49` | Declares it, `z.string().min(1).optional()` |
| `src/env.ts:60`, `src/env.ts:105` | Reads `process.env` and conditionally includes it in the parsed object |
| `.env.example:35` | `SANITY_API_READ_TOKEN=REPLACE`, instructing the operator to provision it |

`grep -rn "SANITY" src/ sanity/ sanity.config.ts sanity.cli.ts` returns no reference to
`env.SANITY_API_READ_TOKEN`. `.env.local` has no line for it at all. This is dead configuration
that looks live, and `.env.example:35` actively instructs an operator to go create a Sanity token
for a code path that does not exist.

### The Sanity project is shared with another property

Not mentioned anywhere in the brief or the prompt, and it changes the cost of the fix.

```
$ npx sanity projects list
ugtw0nl6  2 members  arqui.dev  https://www.sanity.io/manage/project/ugtw0nl6  2024-07-15

$ npx sanity cors list
http://localhost:3333
http://localhost:3000
https://669a8b4c9dd1e06580104dcd--arquidev.netlify.app
https://arqui.dev
```

The project is named `arqui.dev`, predates this study base, carries two members, and its CORS
origins point at `arqui.dev` and a Netlify preview. Its `production` dataset holds five
`offerList` documents. `sanity/schema/post.ts:4` declares the repository's only document type,
`post`, and `grep -rn "offerList"` across the repository returns nothing: the content in
`production` is not Hire Service's.

`docs/arc42/07-deployment-view.md:60` says `arqui.dev` is a different repository and a different
Vercel project, which is accurate and which readers have been generalizing. It is **not** a
different Sanity project.

### Dataset value drift across four declarations

| Declaration | Value |
|-------------|-------|
| `.env.local:18` | `development` |
| `.env.example:34` | `production` |
| `.github/workflows/ci.yml:32` | `production` |
| `docs/arc42/07-deployment-view.md:71-73` | `production` for local, preview and production |
| Sanity CLI resolved workspace | `development` |

The deployment view is wrong about local, measured. The brief asserts Vercel production is also
`development`; **not reached**, see the unreachable section.

### One probe that looked alarming and is not

An anonymous `POST /v2025-01-01/data/mutate/development` with `{"mutations":[]}` returned HTTP
200 and a real transaction id. Sanity's first-party reference closes this: the mutation API states
"All requests must be authenticated", and
[Sanity's own answer on public datasets](https://www.sanity.io/answers/just-do-be-clear-public-datasets-in-sanity-p1608033734341800)
states there is no such thing as public write access. The 200 is the API short-circuiting a
zero-mutation transaction before the permission check. **Not confirmed further on purpose:**
confirming it would require sending a non-empty mutation, which the brief forbids. Recorded as a
probe artifact, not an exposure.

---

## Part 2: What the system does under failure, and where the boundaries are

### Single point of failure, and its blast radius

The Content Lake is the single point of failure for all blog content, and it is the only
dependency in the stack reachable by an anonymous third party with a value published in the
client bundle. Blast radius of the public visibility: every published document in either dataset
whose `_id` contains no dot.

Drafts are **not** in that radius, which the current risk row gets wrong:

> An unauthenticated request to a public dataset can only read documents whose `_id` contains no
> dot, which excludes every draft (`drafts.<documentId>`) and every release version.
> Source: [Sanity, Keeping your data safe](https://www.sanity.io/docs/content-lake/keeping-your-data-safe)

The `!(_id in path("drafts.**"))` filter at `src/features/posts/posts.queries.ts:18` and `:26` is
an editorial correctness measure, so the site renders published content rather than work in
progress. It is not a security control, and it was never load-bearing as one.

### Trust boundaries crossed

| Boundary | What crosses it | Credential | Status |
|----------|-----------------|------------|--------|
| Browser to Vercel | Page request | Supabase session cookie | Enforced, `src/proxy.ts` |
| Vercel to Supabase | Entitlement read | Session-scoped publishable key, RLS | Enforced, ADR-002 |
| Vercel to Content Lake | GROQ query with `$entitled` | **none** | Not a boundary. Anyone can send the same request |
| Browser to Content Lake | Arbitrary GROQ | **none** | Undrawn until now. Published premium bodies cross it |

The fourth row is the finding. It was implied rather than drawn, in exactly the way the role
definition predicts produces a silent misconfiguration.

### Pillar assignment, one per finding

| Finding | CNCF pattern | Severity today |
|---------|--------------|----------------|
| Content read with no credential, so the Content Lake cannot distinguish the app from a stranger | Least privilege | Latent. Zero `post` documents exist |
| `SANITY_API_READ_TOKEN` declared, documented in `.env.example`, read by nothing | Declarative config | Live. An operator following `.env.example:35` provisions an unused credential |
| Risk row states a mitigation that does not exist | Observability by default, applied to documentation | Live. A reviewer reading it concludes the boundary is covered |
| Dataset value differs across four declarations | Declarative config | Live. The deployment view does not describe the running system |
| Sanity project shared with `arqui.dev`, undocumented | Least privilege | Live. A visibility change here is not a local change |

---

## Part 3: Answers to the four questions the prompt asked

### 1. Is ADR-005 wrong, incomplete, or correct with an undocumented constraint?

**Correct, and incomplete. The constraint is documented, not undocumented.** The prompt's third
framing is contradicted by the ADR itself. `docs/adr/ADR-005-paywall-enforced-in-the-groq-query.md:23-24`
reads:

> Sanity's dataset is public-read, so the query itself must not be the only secret.

ADR-005 knew. It carried the public dataset as a decision driver and drew the correct conclusion
from it for the scope it covered: do not rely on the query string being secret. What it never did
was follow the same observation one step further, to "therefore the body is reachable regardless
of what our query asks for", and attach a control. The gap is in its Consequences section, which
lists four controls and none of them acts on the driver at line 23.

The decision in ADR-005 stands and should not be reopened. Option A in ADR-005's own comparison
is still right: a locked body absent from the Node process is still strictly better than a locked
body truncated at render. The new record supplements it and does not supersede it.

### 2. The options, with what each costs

Full treatment in the draft ADR. Summary:

| Option | Premium body readable anonymously | Monthly plan cost at two seats | Source files changed | Survives a Free-plan downgrade |
|--------|-----------------------------------|-------------------------------|----------------------|-------------------------------|
| A: private dataset plus server read token | no | $30 | 2 | no, visibility reverts |
| B: second private dataset for premium bodies | no | $30 | 4 | no |
| C: premium bodies in Postgres behind RLS | no | $0 | 6 or more | yes |
| D: accept, record the limit, name the trigger | yes | $0 | 0 | not applicable |

Cost source: [Sanity pricing](https://www.sanity.io/pricing), read 2026-11-21. Free offers two
public-only datasets; Growth is $15 per seat per month and is the first tier with private
datasets. Project `ugtw0nl6` has two members, so $30 a month on the project as it stands, or $15
a month on a dedicated single-member project.

**What Option A locks in, and the exit cost.** It makes a Sanity billing state into a security
control. Sanity documents that a downgrade to Free converts private datasets back to public, so
the exit path from Growth silently removes the control rather than breaking it. The exit cost is
therefore not money, it is that the failure is invisible. That is the strongest argument in the
set for Option C, and the reason Option C keeps its place in the record rather than being
dismissed.

### 3. What `docs/arc42/11-risks-and-technical-debt.md` should say

The current row at line 32 has both halves wrong, not one.

Current:

| Risk | Impact | Current mitigation | Trigger to do more |
|------|--------|--------------------|--------------------|
| Sanity dataset is public-read | Draft content could be fetched with a guessed query | Queries exclude `drafts.**`, and premium bodies gate on `$entitled` | Content becomes commercially sensitive |

Wrong on the impact: drafts are not anonymously reachable, because a dot in `_id` makes a
document private in a public dataset. Wrong on the mitigation: `$entitled` is a parameter in a
query the application sends, and an attacker writes a different query. Wrong on the trigger too,
because "commercially sensitive" is a judgment and "a premium post exists" is a fact.

Drop-in replacement, two rows for one, because the shared project is a separate risk with a
separate trigger. **Not applied:** `docs/arc42/` belongs to the `arc42-keeper` agent per
CLAUDE.md, and the ADR these rows reference is unnumbered and unapproved.

| Risk | Impact | Current mitigation | Trigger to do more |
|------|--------|--------------------|--------------------|
| Both Sanity datasets are public, so any published premium `body` is readable without a credential | The paywall is a product gate, not a confidentiality control. `NEXT_PUBLIC_SANITY_PROJECT_ID` ships in the client bundle, so the project id is not a secret | None. The `$entitled` condition in `POST_QUERY` governs this application's response only. Drafts are already out of anonymous reach because a dot in `_id` makes a document private, which is editorial correctness rather than a control. Exposure is zero today: neither dataset holds a `post` document | The first post published with `isPremium` true. The fix and its cost are in the private-dataset ADR |
| The Sanity project is shared with `arqui.dev` | A plan, schema or dataset-visibility change to `ugtw0nl6` is a change to another property's infrastructure. Its `production` dataset holds five `offerList` documents this repository has no schema for | None. The queries filter on `_type == "post"`, so foreign documents are inert | Before any plan upgrade or visibility change. Move Hire Service to its own Sanity project first |

The `!(_id in path("drafts.**"))` filter should also stop being described as a security measure
wherever it is. It appears only in the row above, so this is the only edit.

### 4. Is `SANITY_API_READ_TOKEN` part of the answer?

**Yes, and it is the whole mechanism Option A needs.** It is already declared at `src/env.ts:49`
as optional, already validated, and already in the operator's setup contract at `.env.example:35`.
Wiring Option A is one field on `src/lib/sanity.ts:12` plus one entry in the config-check map.

`useCdn: true` at `src/lib/sanity.ts:16` stays correct with a token. `@sanity/client` is `8.14.1`
in `package.json` and installed, and Sanity documents that authenticated requests are cached with
the cache segmented per token. The pre-v3 behavior where a token silently disabled the CDN does
not apply.

Two findings on the token as it stands today:

**It should not stay declared-and-unread while `.env.example` tells the operator to fill it in.**
Either state is defensible, the mixed one is not. Recommended: keep the declaration, because
Option A will use it and `optional()` costs nothing, and change `.env.example:35` to a
commented-out line that names it as the Option A hook.

**It is missing from `src/shared/config-check.ts`.** The `configured` map at lines 20-32 lists
nine variables and not this one. Today that is harmless because nothing reads the token. Under
Option A it becomes the silent failure CLAUDE.md explicitly warns about: an operator who pastes
`SANITY_API_READ_TOKEN=REPLACE` from `.env.example` passes `z.string().min(1)` at `src/env.ts:49`,
sends `REPLACE` as a bearer token to a private dataset, and gets HTTP 200 with an empty result on
every read. The blog renders the empty state at `src/app/(site)/blog/page.tsx:64` and nothing
reports a misconfiguration. `looksPlaceholder` at `src/shared/config-check.ts:17` already matches
`REPLACE`; the variable just has to be in the map. This is an action item in the ADR, not a change
made here: the prompt forbids touching `src/`.

---

## Part 4: Measured versus inferred

| Claim | Basis |
|-------|-------|
| Both datasets are `public` | **Measured.** `sanity datasets visibility get`, both datasets |
| `production` holds 5 `offerList` documents and zero posts | **Measured.** Anonymous GROQ, HTTP 200 with content |
| `development` holds zero documents of any type | **Measured.** Anonymous GROQ plus the visibility result, which together exclude the private-dataset reading |
| The app's content client sends no token | **Measured.** `src/lib/sanity.ts:12-17` |
| Nothing reads `env.SANITY_API_READ_TOKEN` | **Measured.** Repository-wide grep |
| Project `ugtw0nl6` is `arqui.dev`, two members, created 2024-07-15 | **Measured.** `sanity projects list` |
| `offerList` is not this repository's content type | **Measured.** `sanity/schema/post.ts:4` is the only `defineType`, and `offerList` appears nowhere in the repository |
| Local dataset is `development` | **Measured.** `.env.local:18` and the CLI's resolved workspace |
| Project `ugtw0nl6` is on the Sanity Free plan | **Inferred** from two public-only datasets matching the Free tier's allowance. Not confirmed; the plan is only visible at `sanity.io/manage` |
| The five `offerList` documents belong to `arqui.dev` | **Inferred** from the project name, the CORS origins, and the absence of the type in this repository |
| Vercel production uses `development` | **Not reached.** Carried from the brief, unverified |

---

## What could not be reached

| Question | Why | Who can close it |
|----------|-----|------------------|
| Is project `ugtw0nl6` on Free, Growth, or Enterprise? | The CLI exposes no plan field and the management API returned HTTP 401 unauthenticated. This sets whether Option A costs $30 a month or $0 incremental | Operator, at `sanity.io/manage/project/ugtw0nl6` |
| What is `NEXT_PUBLIC_SANITY_DATASET` in Vercel production? | Read-only on networked systems, and CLAUDE.md states the Vercel MCP server is configured but unauthenticated and not a fact source | Operator, `vercel env ls production` |
| Is the dataset writable by an anonymous caller? | Resolving it requires sending a non-empty mutation, which the brief forbids. First-party documentation says no, and the empty-mutation 200 is explained as a short-circuit | Closed by documentation; no probe needed |
| Who is the second member of project `ugtw0nl6`, and do they have Studio publish rights? | Member identity requires the management API, which refused the unauthenticated read. It sets who can publish a premium post and so trip the trigger | Operator, at `sanity.io/manage` |

No source file under `src/` was changed. No write reached Sanity, Vercel, or any dashboard. No
secret value is printed in this artifact or in the ADR. Nothing was committed or pushed.

---

## Proposed reviewer-memory tables for `CLAUDE.md`

Neither table exists. These are first versions, seeded from this run and from the memory supplied
with it. The point is that the next review starts from here instead of rediscovering it.

### Already fixed, do not re-report

| Finding | Fixed in | Evidence it holds |
|---------|----------|-------------------|
| `next-sanity` pulled the Sanity CLI into the production tree, 21 advisories | ADR-006 | `package.json` has `@sanity/client` in `dependencies`, `sanity` and `@sanity/vision` in `devDependencies` |
| `src/proxy.ts` read raw `process.env` and turned every route into a 500 on an unset variable | Recorded in CLAUDE.md forbidden patterns | No `process.env` outside `src/env.ts`, `src/env.public.ts` and the Sanity config files |
| `NEXT_PUBLIC_VERCEL_URL` used as the production site URL, breaking magic links behind deployment protection | `src/env.public.ts:56-65` | The fallback chain prefers `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` in production |
| Four silent catches hid a misconfigured Sanity project | CLAUDE.md forbidden patterns | Every catch returns `err(...)`, logs, or rethrows |
| `paywall-guardian` invariants 1 to 6 | Verified 2026-11-11 | Re-read 2026-11-21 at `posts.queries.ts:28`, `posts.gate.ts:11`, `entitlements.service.ts:45`. No regression |

### Known and accepted

| Item | Why accepted | Reopening condition |
|------|--------------|---------------------|
| Both Sanity datasets are public | Zero `post` documents exist, and the fix changes the plan and visibility of a Sanity project owned by `arqui.dev` | The first post published with `isPremium` true, or any content in `ugtw0nl6` becoming commercially sensitive |
| Rate limiting is per serverless instance | Study base, no real spam | The forms get real spam, or a limit has to be provable |
| CSP is report-only | No real customer traffic yet | Before any real customer traffic |
| Build-time `npm audit` is reported, not gated | None of the 32 findings reach a request | All three chains clean: Sanity CLI, `eslint-config-next`, Storybook |
| Previews share the dev Supabase project | The dev project holds no real data | Real user data lands in the dev project |
| Row level security has no automated test | Policies are short and hand-reviewed | Roadmap item C2, needs Postgres in CI |
| `vitest` and `vite` in the production install | Arrive through an optional peer on `get-it`, zero known vulnerabilities | An advisory lands on either, or `@sanity/client` drops the optional peer |

---

## Prepared, not committed

```
docs/adr/ADR-NNN-private-sanity-dataset-as-the-premium-content-gate.md   (new, Status: Proposed)
docs/runs/2026-11-21-full-review/02-sanity-dataset-paywall-cloud-solutions-architect.md   (new)
```

Draft commit subject, per the Conventional Commits rules in CLAUDE.md:

```
docs: draft the private sanity dataset decision
```

The ADR carries no number, Status `Proposed`, and is not approved. This role does not approve its
own proposals.
