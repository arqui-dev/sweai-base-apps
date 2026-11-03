# Dependency register

Every production dependency, why it is here, and what it saved. Required by
[ADR-007](adr/ADR-007-dependency-and-vulnerability-policy.md): a dependency
without a row is a review failure.

**Runtime tree: 12 direct, 117 top-level and 365 packages in a real
`npm ci --omit=dev`, 0 known vulnerabilities** (`npm run audit:runtime`).

The counts come from installing with `--omit=dev` into a clean directory, not
from `npm ls --omit=dev --all`. That command follows optional peer edges and
reports `vitest`, `vite`, `playwright` and every `esbuild` platform binary
underneath `@sanity/client`, which is a traversal artifact rather than what
ships. `vitest` and `vite` do land in a production install, through an optional
peer on `get-it`; that pre-dates Storybook and is recorded in
[section 11](arc42/11-risks-and-technical-debt.md).

## Production

| Package | For | Replaced or made unnecessary | Transitive | Ladder rung cleared |
|---------|-----|------------------------------|-----------:|---------------------|
| `next` | The framework. Routing, RSC, bundling, image optimization, headers | A hand-rolled React SSR setup, an HTTP server, a bundler | 54 | Not replaceable by anything smaller that still does RSC |
| `react`, `react-dom` | Rendering | n/a | 0, 2 | Peer of `next` |
| `@sanity/client` | GROQ queries against the content API | `next-sanity`, which pulled the whole Sanity CLI into production ([ADR-006](adr/ADR-006-hosted-sanity-studio.md)) | 77 | Hand-writing the query API would mean hand-writing retry, auth and the `next` cache integration |
| `groq` | The `groq` template tag, for editor tooling on query strings | Nothing at runtime, it returns the string unchanged | 0 | Kept because it is zero-dependency; a plain template literal is the fallback if it ever is not |
| `@sanity/image-url` | Builds CDN transform URLs for Sanity images | Hand-built query strings that break when Sanity changes its parameters | 3 | A documented URL contract owned by the vendor, not ours to guess |
| `@portabletext/react` | Renders Sanity's Portable Text block format to JSX | A recursive renderer over an undocumented-to-us tree shape | 3 | The format is a specification; the renderer tracks it |
| `@supabase/supabase-js` | Service-role client for the webhook and the campaign sender | Raw PostgREST calls plus auth header handling | 9 | Would mean reimplementing the auth and query protocol |
| `@supabase/ssr` | Cookie-based session handling for Server Components and the proxy | Session refresh, cookie chunking and `getAll`/`setAll` semantics by hand. This is auth; see the never-hand-roll list | 2 | Security-critical, explicitly out of scope for hand-rolling |
| `stripe` | Checkout sessions and webhook signature verification | Signature verification by hand, which is the one place a mistake gives away paid content | 2 | Security-critical |
| `resend` | Transactional and batch email | An SMTP client and a mail server | 5 | No smaller option that still batches |
| `zod` | Validation at every trust boundary, including env | Hand-written type guards for 7 schemas, with no inference | 0 | Zero-dependency, and the alternative is a type-guard layer that silently drifts from the types |

Transitive counts per package were removed from this table when the measurement
above showed them to be peer-traversal artifacts. The honest figure is the
whole-tree count at the top.

## Build and editor only

Not in the runtime tree. `npm audit` reports findings here; they are not gated,
because a Vite plugin cannot be reached by an HTTP request. See
[ADR-007](adr/ADR-007-dependency-and-vulnerability-policy.md) section 1 and the
roadmap item for driving this to zero.

| Package | For | Note |
|---------|-----|------|
| `sanity`, `@sanity/vision`, `styled-components` | `npx sanity deploy` builds the hosted Studio from `sanity/schema/` | The source of every build-time finding. Kept because the schema must stay in version control |
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

| A component catalogue page | Reviewing components in isolation | Storybook, because the stories also run as the browser test suite |

## Overrides

| Override | Why |
|----------|-----|
| `vite-plus: 1.4.0` | `storybook@10.4.0` and later declare a peer `vite-plus: "^0.1.15 \|\| ^0.2.0"`, and the only published version is `1.4.0`. Nothing satisfies the range, so npm 10.9.3 reaches a null node in `#loadPeerSet` and dies with `Cannot read properties of null (reading 'edgesOut')` instead of reporting an unmet peer. The override unblocks resolution without installing anything: `npm ls vite-plus` comes back empty. Remove it when Storybook corrects the range. |

## Adding one

The ladder, the deep-scan commands, and the reject criteria are in
[ADR-007](adr/ADR-007-dependency-and-vulnerability-policy.md) sections 3 and 5.
Short version: climb the ladder, run the scan, add the row, in the same commit
as the install.
