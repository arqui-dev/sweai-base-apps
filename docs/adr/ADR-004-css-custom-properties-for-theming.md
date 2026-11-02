# ADR-004: CSS custom properties for theming instead of per-theme components

**Date:** 2026-11-02
**Status:** Accepted

---

## Context

The brief asked for selectable designs: minimalist, modern, brutalist, and two
more. The themes differ in more than color. Brutalist uses 3px black borders,
hard offset shadows and zero radius; editorial uses a serif display face on
cream; terminal is monospace with square edges. Those differences touch borders,
radius, shadow, font family, weight, letter spacing and text transform across
every component.

## Decision drivers

- Five looks today, and the base exists so a sixth can be added by a future
  product.
- One component tree. A theme must not fork a component.
- Switching must not flash the wrong palette on first paint.
- Tailwind v4 is the only styling tool, by constraint.

## Options considered

### Option A: CSS custom properties per `[data-theme]` block (chosen)

Each theme is a block of variables in `themes.css`. `globals.css` maps them to
Tailwind tokens with `@theme inline`. Components use `bg-surface`,
`border-border`, `rounded-(--radius)`.

**Pros:** One attribute switches everything with no re-render. A new theme is
one CSS block plus one array entry. Components never name a theme.
**Cons:** Only properties that were tokenized can vary, so adding a new axis
means touching all five blocks.

### Option B: A Tailwind variant per theme

`theme-brutalist:border-4 theme-editorial:font-serif` on each element.

**Pros:** No indirection, everything visible at the call site.
**Cons:** Every component accumulates five variants of every property, and
adding a sixth theme edits every component. The opposite of the goal.

### Option C: A component library instance per theme

Separate component sets selected at the layout level.

**Pros:** Total freedom per theme, including different markup.
**Cons:** Five copies of every component to keep in step. Unmaintainable by one
person.

## Comparison

| Criterion | A: custom properties | B: Tailwind variants | C: component set per theme |
|-----------|----------------------|----------------------|----------------------------|
| Files touched to add a theme | 2 | every component | one new component set |
| Component knows the theme | no | yes | yes |
| Markup can differ per theme | no | no | yes |
| Switch cost at runtime | one attribute | one attribute | full re-render |
| Flash of wrong theme | avoided via server-rendered attribute | same | same |

## Recommendation

Custom properties. The themes differ in token values, not in structure, so
tokens are exactly the right granularity. Option B inverts the maintenance cost
the base is meant to reduce.

Option C becomes correct if a theme ever needs different markup, for example a
layout with the navigation on the side. That is a different product, not a
theme.

## Consequences

- `src/app/themes.css` holds five `[data-theme]` blocks with eleven tokens each.
- `src/app/globals.css` maps tokens to Tailwind through `@theme inline` and sets
  the display font rules for `h1`, `h2`, `h3` and `.font-display`.
- `src/components/ui/styles.ts` exposes `btn`, `card`, `input`, `label` and
  `section` as class strings. No component names a color.
- The root layout reads the `theme` cookie and renders `data-theme` on `<html>`,
  which is what prevents the flash. `isThemeId` rejects an unknown cookie value,
  so a tampered cookie cannot produce an unstyled page.
- Adding an axis, such as a spacing scale per theme, means a new token in all
  five blocks. That is the accepted cost.

## Sources

- https://tailwindcss.com/docs/theme
- https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
