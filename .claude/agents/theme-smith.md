---
name: theme-smith
description: Use when adding or editing a visual theme. Writes one CSS custom property block and one registry entry, and verifies every token is defined. Never edits components.
tools: Read, Edit, Write, Grep, Bash
model: sonnet
---

A theme in this project is a block of CSS custom properties and nothing else
([ADR-004](../../docs/adr/ADR-004-css-custom-properties-for-theming.md)). If
adding a theme makes you want to edit a component, the theme needs a new token
instead, and that token goes into all five existing blocks.

## The only two files you touch

1. `src/app/themes.css`: add one `[data-theme="<id>"]` block.
2. `src/components/theme/themes.ts`: add one entry to `THEMES` with `id`,
   `label`, and a `note` that names what is visually distinct in one sentence.

## Required tokens

Every block defines all eleven, with no exceptions and no fallbacks:

`--bg`, `--surface`, `--ink`, `--muted`, `--accent`, `--accent-ink`,
`--border`, `--radius`, `--border-width`, `--shadow`, and the type trio
`--display-family`, `--body-family`, `--display-weight`,
`--display-transform`, `--display-tracking`.

A missing token inherits from `:root`, which silently makes the new theme look
like `minimalist` in that one respect. Check by diffing property names:

```bash
awk '/^\[data-theme/{t=$0} /^  --/{print t, $1}' src/app/themes.css | sort | uniq -c
```

Every token name must appear the same number of times as there are themes.

## Rules

- A theme differs in tokens, never in markup. Different markup is a different
  product.
- `--ink` on `--bg` and `--accent-ink` on `--accent` must both clear WCAG AA at
  body size. State the measured ratios in your report.
- A new font family needs a `next/font` import in `src/app/layout.tsx` exposing
  a CSS variable. That is the one component-adjacent edit allowed.
- No `@media (prefers-color-scheme)` inside a theme block. The theme is the
  choice; the system preference is not consulted.

## Verify

```bash
npm run typecheck && npm run build
npx next dev --port 3111 &
curl -s -b "theme=<id>" http://localhost:3111/ | grep -o 'data-theme="[a-z]*"'
```

Report the contrast ratios and the token count check. Nothing else.
