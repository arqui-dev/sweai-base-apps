# ADR-008: One Vercel project per deployable, and no monorepo yet

**Date:** 2026-11-03
**Status:** Accepted
**Related ADRs:** [ADR-006](ADR-006-hosted-sanity-studio.md) decided where the Studio lives; this decides where everything else deploys.

---

## Context

The repository now produces three things that can be served: the Next.js
application, the Storybook component catalogue, and the Sanity Studio. The
Studio is already hosted by Sanity. The question raised was whether to give the
Studio and Storybook their own Vercel projects, or to restructure the
repository as a monorepo first.

The repository is named for its purpose: a base that future products start
from. That makes the monorepo question a real one rather than premature, since
a second product is the stated intent.

## Decision drivers

- Three deployables today, but only one of them is an application.
- A monorepo earns its cost through shared packages between apps. There is one
  app, so there is nothing to share yet.
- Package boundaries drawn before the second consumer exists are guesses, and a
  wrong boundary is more expensive to undo than to create later.
- A component catalogue nobody can open is a catalogue nobody uses.
- Build minutes and dashboard clutter are real but small costs.

## Options considered

### Option A: A Vercel project per deployable, repository unchanged (chosen)

The app keeps `sweai-base-apps`. Storybook gets `sweai-storybook`, same
repository, different build command and output directory. The Studio stays on
Sanity.

**Pros:** Each deployable gets its own URL, build settings and protection
rules. No restructuring, no path alias changes, no new tooling. Vercel supports
several projects from one repository natively.
**Cons:** Both projects run `npm ci` over the whole repository, so the app
build installs Storybook and the Storybook build installs Next. Every push
builds both.

### Option B: Monorepo now, with npm workspaces or Turborepo

Restructure to `apps/web`, `apps/storybook`, `packages/ui`.

**Pros:** Each project installs only what it needs. A shared `packages/ui` is
ready for the second product. Task caching.
**Cons:** The restructuring touches path aliases, both Vercel projects' root
directories, CI, the dependency register and every doc that cites a file path,
for no present benefit. Worse, the package boundaries would have to be guessed
before the second product exists, and a premature boundary is the standard way
a monorepo becomes a liability.

### Option C: Storybook in the application itself, Studio on Vercel

Serve the catalogue from a route, and move the Studio onto Vercel.

**Pros:** One project.
**Cons:** Reverses [ADR-006](ADR-006-hosted-sanity-studio.md), which removed
the Studio from the app to take 21 vulnerabilities out of the production
dependency tree. Storybook in a route would pull its builder into the
application build the same way.

## Comparison

| Criterion | A: project per deployable | B: monorepo now | C: all in the app |
|-----------|---------------------------|-----------------|-------------------|
| Files moved today | 0 | most of `src/` | some |
| Install scope per build | whole repository | per workspace | whole repository |
| Ready for a second product | needs the migration later | yes | no |
| Risk of a wrong package boundary | none yet | high, nothing to validate against | n/a |
| Production dependency tree | unchanged, 0 vulnerabilities | unchanged | regresses |
| Studio hosting cost | none, Sanity hosts it | none | a Vercel project |

## Recommendation

A project per deployable, and defer the monorepo.

The deciding argument against option B is not the restructuring cost, which is
a day. It is that the useful part of a monorepo is `packages/ui`, and its
boundary can only be drawn correctly once a second consumer exists to argue
with. Drawing it now means committing to a guess and then either living with it
or paying the migration twice.

The Studio stays on Sanity for the reason in ADR-006, which has not changed. A
Vercel project for it would add build minutes and a second place to configure,
while Vercel's deployment protection is redundant in front of an editor that
already requires a Sanity login. Revisit only if the Studio needs a custom
domain that Sanity cannot serve.

## The trigger for the monorepo

Convert when the **second deployable application** starts, not before. At that
point:

1. Move the current app to `apps/web` and set the Vercel Root Directory.
2. Extract into `packages/` only what the second application actually imports.
   Likely `components/ui`, `components/theme` and `shared/`. Unlikely
   `features/`, which is product-specific.
3. Point the Storybook project at the package that owns the components rather
   than at the app.

Two signals say the moment arrived early: a second Vercel project needing a
different `npm ci` scope to keep builds under control, or copy-pasting a
component between products.

## Consequences

- `sweai-storybook` is a Vercel project on the same repository, framework
  `null`, build `npm run storybook:build`, output `storybook-static`. It needs
  no environment variables: verified that the catalogue builds with every
  variable empty, because no story imports `src/env.ts` or `src/env.public.ts`.
- Both projects rebuild on every push to `main`. If that becomes expensive
  before the monorepo is justified, Vercel's Ignored Build Step can skip the
  Storybook build when no component changed, which is a setting rather than a
  restructuring.
- `arquidev-sweai`, a third project pointing at this repository with 21 failed
  deployments and no successful one, has been deleted. Two projects now build
  from this repository and both succeed.
- `arqui-dev` is a separate project from a separate repository, Vite rather
  than Next, and serves the company landing page. It is outside this
  repository's scope and stays that way: this repository is the study base, not
  the business site.
- The deployment view in section 7 now lists three deployables.

## Sources

- https://vercel.com/docs/monorepos
- https://vercel.com/docs/projects/overview#connecting-a-git-repository
- https://storybook.js.org/docs/sharing/publish-storybook
