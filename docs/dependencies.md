# Dependency register

Every production dependency, why it is here, and what it saved. Required by
[ADR-007](adr/ADR-007-dependency-and-vulnerability-policy.md): a dependency
without a row is a review failure.

**Runtime tree: 12 direct, 78 top-level packages, 0 known vulnerabilities**
(`npm run audit:runtime`).

Getting that number right took three wrong attempts, so the method matters as
much as the figure.

| Command | Reports | Why it is wrong |
|---------|--------:|-----------------|
| `npm ls --omit=dev --all` | 237 | Follows optional peer edges, so it lists `vitest`, `playwright` and every `esbuild` platform binary under `@sanity/client` |
| `ls node_modules \| wc -l` after `npm ci --omit=dev` | 117 | Counts 61 empty `@scope` directories that npm leaves behind |
| `find node_modules -name package.json \| wc -l` | 365 | Counts 287 subpath marker files such as `stripe/esm` and `rxjs/webSocket` |
| Counting directories that contain a `package.json` with a `name` | **78** | Correct |

`vitest` and `vite` do land in a production install, through an optional peer
that `get-it` declares. That pre-dates Storybook and is recorded in
[section 11](arc42/11-risks-and-technical-debt.md).

## Production

| Package | For | Replaced or made unnecessary | Ladder rung cleared |
|---------|-----|------------------------------|---------------------| `next` | The framework. Routing, RSC, bundling, image optimization, headers | A hand-rolled React SSR setup, an HTTP server, a bundler | 54 | Not replaceable by anything smaller that still does RSC |
| `react`, `react-dom` | Rendering | n/a | Peer of `next` |
| `@sanity/client` | GROQ queries against the content API | `next-sanity`, which pulled the whole Sanity CLI into production ([ADR-006](adr/ADR-006-hosted-sanity-studio.md)) | Hand-writing the query API would mean hand-writing retry, auth and the `next` cache integration |
| `groq` | The `groq` template tag, for editor tooling on query strings | Nothing at runtime, it returns the string unchanged | Rung 5 declined deliberately. `const groq = (s, ...v) => String.raw(s, ...v)` is the one-line replacement; the package is kept only because it is zero-dependency and gives editors a hook |
| `@sanity/image-url` | Builds CDN transform URLs for Sanity images | Hand-built query strings that break when Sanity changes its parameters | A documented URL contract owned by the vendor, not ours to guess |
| `@portabletext/react` | Renders Sanity's Portable Text block format to JSX | A recursive renderer over an undocumented-to-us tree shape | The format is a specification; the renderer tracks it |
| `@supabase/supabase-js` | Service-role client for the webhook and the campaign sender | Raw PostgREST calls plus auth header handling | Would mean reimplementing the auth and query protocol |
| `@supabase/ssr` | Cookie-based session handling for Server Components and the proxy | Session refresh, cookie chunking and `getAll`/`setAll` semantics by hand. This is auth; see the never-hand-roll list | Security-critical, explicitly out of scope for hand-rolling |
| `stripe` | Checkout sessions and webhook signature verification | Signature verification by hand, which is the one place a mistake gives away paid content | Security-critical |
| `resend` | Transactional and batch email | An SMTP client and a mail server | No smaller option that still batches |
| `zod` | Validation at every trust boundary, including env | Hand-written type guards for 7 schemas, with no inference | Zero-dependency, and the alternative is a type-guard layer that silently drifts from the types |

Per-package transitive counts were removed. Every available command measures
them through peer edges, which put `@sanity/client` at 77 when its real closure
is 7. The honest figure is the whole-tree count at the top.

## Build and editor only

Not in the runtime tree. `npm audit` reports findings here; they are not gated,
because a Vite plugin cannot be reached by an HTTP request. See
[ADR-007](adr/ADR-007-dependency-and-vulnerability-policy.md) section 1 and the
roadmap item for driving this to zero.

| Package | For | Note |
|---------|-----|------|
| `sanity`, `@sanity/vision`, `styled-components` | `npx sanity deploy` builds the hosted Studio from `sanity/schema/` | 19 of the 32 build-time findings. Kept because the schema must stay in version control |
| `typescript`, `@types/*` | Types | |
| `eslint`, `eslint-config-next` | Lint | |
| `tailwindcss`, `@tailwindcss/turbopack` | Styling | |
| `vitest` | Tests, both projects in `vitest.config.mts` | |
| `storybook`, `@storybook/nextjs-vite` | The component catalogue and its builder | Chosen over a hand-rolled preview page: stories double as the browser test suite |
| `@storybook/addon-vitest` | Runs every story as a Chromium test under `npm run test` | This is what makes the catalogue load-bearing instead of decorative |
| `@storybook/addon-a11y` | axe on every story, set to `error` | A violation fails the test run rather than sitting in a panel |
| `@storybook/addon-docs` | Autodocs from the story files | |
| `eslint-plugin-storybook` | Lint rules for story files | |
| `vite` | Storybook's builder | Pinned `^8.3.5`. Storybook's init wrote `latest`, which ADR-007 forbids |
| `@vitest/browser-playwright`, `playwright` | Chromium driver for the story tests | `playwright` pinned `^1.64.1`, also written as `latest` by the init |
| `@tailwindcss/vite` | Tailwind inside Storybook's Vite build | The app uses `@tailwindcss/turbopack`; without this one `@import "tailwindcss"` passes through untransformed and every utility silently becomes a no-op |

## Deliberately not added

The alternative that lost, and what it lost to. This list is the point of the
register: it is cheaper to read than to re-litigate.

| Not added | Would have done | What does it instead |
|-----------|-----------------|----------------------|
| A state manager | Cart quantity, theme choice | `useState`, and a cookie for the theme |
| A component library | Buttons, cards, inputs | Five class-string helpers in `src/components/ui/styles.ts` |
| A form library | Validation, submit state | `required` and `type="email"` on the input, `useState` for the one pending flag, Zod on the server |
| A theming library | Five selectable designs | CSS custom properties under `[data-theme]` ([ADR-004](adr/ADR-004-css-custom-properties-for-theming.md)) |
| An ORM or query builder | Database access | The Supabase client, with row level security as the authorization layer ([ADR-002](adr/ADR-002-rls-as-the-authorization-layer.md)) |
| A logging library | Structured logs | 12 lines around `console`, JSON per line, collected by Vercel |
| An HTML sanitizer | Escaping values bound for email | `escapeHtml`, 9 lines, for interpolation into our own templates only. A sanitizer would be required for rendering untrusted *documents*, which we never do |
| A URL validation library | Blocking `javascript:` hrefs from the CMS | `safeHref`, 9 lines over the built-in `URL` parser and a 3-scheme allowlist |
| A rate limiter | Brake on the public forms | A `Map` and a fixed window, with its per-instance ceiling written in the file |
| A crypto helper | HMAC for unsubscribe links, constant-time compare | `node:crypto` |
| `next-sanity` | Queries plus the embedded Studio | `@sanity/client`, after it cost 21 vulnerabilities ([ADR-006](adr/ADR-006-hosted-sanity-studio.md)) |
| A hand-built component catalogue page | Reviewing components in isolation | Storybook, because the stories also run as the browser test suite |

## Overrides

None. An `overrides` entry for `vite-plus` was added here to work around an npm
10.9.3 crash while installing Storybook, with the stated reason that no
published version satisfied Storybook's peer range. That reason was wrong: 20
of the 157 published versions satisfy it, and the figure came from reading
`npm view vite-plus version`, which returns the `latest` tag rather than the
only version. The peer is also declared `optional: true`, so npm has no reason
to resolve it. Installation was re-verified without the override and resolves
cleanly, so it was removed. The crash was real and observed; its cause remains
unexplained and was most likely an npm cache artifact.

## Adding one

The ladder, the deep-scan commands, and the reject criteria are in
[ADR-007](adr/ADR-007-dependency-and-vulnerability-policy.md) sections 3 and 5.
Short version: climb the ladder, run the scan, add the row, in the same commit
as the install.
