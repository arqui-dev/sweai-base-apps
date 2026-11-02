"use client";

import { useState } from "react";
import { applyTheme } from "@/components/theme/apply-theme";
import type { ThemeId } from "@/components/theme/themes";
import { btn, input, label } from "@/components/ui/styles";

/**
 * The preview works because every theme selector is `[data-theme="..."]` rather
 * than `html[data-theme="..."]`, so putting the attribute on this wrapper
 * restyles its whole subtree. All five previews render at once, in their real
 * colors, with no iframe and no duplicated component.
 */
export function ThemeCard({
  id,
  name,
  note,
  isActive,
}: {
  id: ThemeId;
  name: string;
  note: string;
  isActive: boolean;
}) {
  const [picked, setPicked] = useState(false);

  return (
    <section
      data-theme={id}
      aria-labelledby={`theme-${id}`}
      className="bg-bg text-ink border-(length:--border-width) border-border rounded-(--radius) shadow-(--shadow) overflow-hidden"
    >
      <div className="border-b-(length:--border-width) border-border px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id={`theme-${id}`} className="font-display text-xl">
            {name}
          </h2>
          {(isActive || picked) && (
            <span className="text-accent text-xs">{picked ? "applied" : "active"}</span>
          )}
        </div>
        <p className="mt-1.5 text-sm text-muted">{note}</p>
      </div>

      <div className="grid gap-4 px-5 py-5">
        <h3 className="text-base">A heading in this theme</h3>
        <p className="text-sm text-muted">
          Body copy at the size a post uses, so the measure and the contrast are the real ones.
        </p>

        <div>
          <label htmlFor={`sample-${id}`} className={label()}>
            Email
          </label>
          <input id={`sample-${id}`} placeholder="you@company.com" className={input()} readOnly />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={btn()}>Primary</span>
          <span className={btn("ghost")}>Ghost</span>
        </div>

        <div className="bg-surface border-(length:--border-width) border-border rounded-(--radius) px-4 py-3 text-xs text-muted">
          Surface, border and radius sample
        </div>
      </div>

      <div className="border-t-(length:--border-width) border-border px-5 py-4">
        <button
          type="button"
          onClick={() => {
            applyTheme(id);
            setPicked(true);
          }}
          className={btn()}
        >
          Use this design
        </button>
      </div>
    </section>
  );
}
