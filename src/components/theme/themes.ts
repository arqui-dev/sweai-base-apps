/**
 * Five presets. A theme is nothing but a block of CSS custom properties in
 * `themes.css`, so adding a sixth means one CSS block and one entry here. No
 * component code changes.
 */
export const THEMES = [
  {
    id: "minimalist",
    label: "Minimalist",
    note: "Thin rules, wide margins, one accent. Reads like a well set book.",
  },
  {
    id: "modern",
    label: "Modern",
    note: "Dark surfaces, soft shadows, indigo accent. The default SaaS look.",
  },
  {
    id: "brutalist",
    label: "Brutalist",
    note: "Hard black borders, offset shadows, no rounding, shouting type.",
  },
  {
    id: "editorial",
    label: "Editorial",
    note: "Cream paper, serif headlines, red accent. Built for long reading.",
  },
  {
    id: "terminal",
    label: "Terminal",
    note: "Monospace everywhere, phosphor green on near black, square edges.",
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "minimalist";
export const THEME_COOKIE = "theme";

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === "string" && THEMES.some((t) => t.id === value);
