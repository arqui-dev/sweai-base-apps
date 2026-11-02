"use client";

import { useState } from "react";
import { THEMES, THEME_COOKIE, type ThemeId } from "./themes";

/**
 * Writes the attribute the CSS reads, then persists the choice in a cookie so
 * the server renders the same theme on the next request and no flash occurs.
 */
export function ThemeSwitcher({ current }: { current: ThemeId }) {
  const [theme, setTheme] = useState<ThemeId>(current);

  const apply = (next: ThemeId) => {
    document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    setTheme(next);
  };

  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <span className="sr-only sm:not-sr-only">Theme</span>
      <select
        value={theme}
        onChange={(event) => apply(event.target.value as ThemeId)}
        className="bg-surface text-ink border-(length:--border-width) border-border rounded-(--radius) px-2 py-1.5 text-xs"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
