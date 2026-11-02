# ADR-006: Host the Sanity Studio on Sanity instead of embedding it

**Date:** 2026-11-02
**Status:** Accepted
**Related ADRs:** Reverses the Studio half of the original content setup. [ADR-005](ADR-005-paywall-enforced-in-the-groq-query.md) is unaffected: the paywall still lives in the GROQ query.

---

## Context

The Studio was mounted inside the application at `/studio` so the content
schema stayed in version control and one deploy shipped both the site and the
editor. Doing that required `next-sanity`, which depends on the `sanity` editor
package as a production dependency, which in turn pulls `@sanity/cli`,
`@vercel/frameworks` and a Vite plugin tree. `npm audit --omit=dev` reported 21
vulnerabilities, 3 of them high, every one of them inside that tree. None was
reachable from a request: the flagged `undici` copy sat inside a build plugin
while the runtime resolved a patched 7.30.1. The cost was therefore not
exploitability, it was a permanently noisy audit and a large client bundle on a
route only the owner opens.

## Decision drivers

- `npm audit` has to be usable. An audit that always reports 3 high findings
  trains people to ignore it, which is worse than no audit.
- The editor is opened by one person. Shipping its bundle from the product's own
  domain buys nothing.
- The schema must stay in version control either way, since it defines the
  content contract the paywall depends on.
- `sanity deploy` already exists and is one command.

## Options considered

### Option A: Hosted Studio, queries through `@sanity/client` (chosen)

Delete the `/studio` route. Keep `sanity.config.ts`, `sanity.cli.ts` and
`sanity/schema/` for `npx sanity deploy`, with `sanity` as a devDependency.
Read content with `@sanity/client` and the zero-dependency `groq` package.

**Pros:** Production dependency tree drops to 0 vulnerabilities. No editor
bundle on the product domain. Schema stays in git. `@sanity/client` supports
the Next `cache` and `next` fetch options natively, so the query code is
unchanged apart from two imports.
**Cons:** Editors use a second domain, publishing the Studio is a separate
`sanity deploy` step, and the Studio can drift from the schema in git if someone
forgets to run it.

### Option B: Keep the embedded Studio

**Pros:** One deploy, one domain, Studio and schema can never drift.
**Cons:** 21 production audit findings that cannot be fixed without dropping
the package, since the fix npm suggests is a major downgrade of `sanity`
itself. Editor bundle served from the product domain.

### Option C: Embedded Studio in a separate Vercel project

A second Next application in the repository that mounts only the Studio.

**Pros:** Product tree stays clean, one repository, Studio and schema versioned
together.
**Cons:** A second project, a second deploy and a second set of environment
variables, to host something Sanity hosts for free.

## Comparison

| Criterion | A: hosted | B: embedded | C: separate project |
|-----------|-----------|-------------|---------------------|
| Production `npm audit` findings | 0 | 21, 3 high | 0 |
| Editor bundle on the product domain | no | yes | no |
| Deploy steps to publish content changes | 1 (`sanity deploy`, only on schema change) | 0 | 1 |
| Can the Studio drift from the schema in git | yes, until redeployed | no | no |
| Platforms to operate | 2 | 1 | 2 |
| Schema in version control | yes | yes | yes |

## Recommendation

Hosted Studio. The deciding criterion is that option B's findings are
unfixable rather than merely outstanding: `npm audit fix` offers a major
downgrade of `sanity` as the only remedy, so the repository would carry three
permanent high findings and the secrets and audit signal would decay into
noise. Drift is a real cost of option A, and it is mitigated by the schema
living in git and by `sanity deploy` being one command.

Option B becomes correct again if `next-sanity` ever moves `sanity` to a peer
or optional dependency, which would let the Studio be embedded without the CLI
tree.

## Consequences

- `src/app/studio/` is deleted. `/studio` now returns 404 on this domain.
- `next-sanity` is removed. `src/lib/sanity.ts` uses `@sanity/client` and
  `src/features/posts/posts.queries.ts` imports `groq` from the `groq` package.
  The queries themselves did not change.
- `sanity`, `@sanity/vision` and `styled-components` moved to
  devDependencies. They are needed only by `npx sanity deploy`, and now that
  nothing in `src/` imports them that placement is accurate rather than a
  workaround.
- Production dependency count: 21 vulnerabilities to 0.
- `NEXT_PUBLIC_SANITY_STUDIO_URL` is a new optional variable. The hostname is
  chosen at `sanity deploy` time and cannot be derived from the project id, so
  the footer and the empty blog state link to the Studio only when it is set.
- `robots.ts` no longer disallows `/studio`, and `src/proxy.ts` no longer
  excludes it from the matcher.
- Publishing a schema change is now two steps: commit, then `npx sanity deploy`.
  Section 7 of the architecture documentation carries the command.

## Sources

- https://www.sanity.io/docs/deployment
- https://www.sanity.io/docs/js-client#nextjs
