"use client";

import { useState } from "react";
import { applyTheme } from "./apply-theme";
import { THEMES, type ThemeId } from "./themes";

export function ThemeSwitcher({ current }: { current: ThemeId }) {
  const [theme, setTheme] = useState<ThemeId>(current);

  const select = (next: ThemeId) => {
    applyTheme(next);
    setTheme(next);
  };

  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <span className="sr-only sm:not-sr-only">Theme</span>
      <select
        value={theme}
        onChange={(event) => select(event.target.value as ThemeId)}
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
