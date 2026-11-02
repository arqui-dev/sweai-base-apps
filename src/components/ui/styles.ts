/**
 * ponytail: class-string helpers instead of wrapper components. They compose
 * with <button>, <a> and <Link> alike, and every token comes from the active
 * theme, so there is nothing to re-skin per theme. Promote to real components
 * only when one needs its own state.
 */
export const btn = (variant: "primary" | "ghost" = "primary"): string =>
  [
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium",
    "rounded-(--radius) border-(length:--border-width) shadow-(--shadow)",
    "transition-transform active:translate-y-px disabled:opacity-50 disabled:pointer-events-none",
    variant === "primary"
      ? "bg-accent text-accent-ink border-border hover:opacity-90"
      : "bg-surface text-ink border-border hover:bg-bg",
  ].join(" ");

export const card = (): string =>
  "bg-surface border-(length:--border-width) border-border rounded-(--radius) shadow-(--shadow) p-6";

export const input = (): string =>
  [
    "w-full px-4 py-2.5 text-sm bg-bg text-ink placeholder:text-muted",
    "border-(length:--border-width) border-border rounded-(--radius)",
  ].join(" ");

export const label = (): string => "block text-xs font-medium text-muted mb-1.5";

export const section = (): string => "mx-auto w-full max-w-5xl px-5 py-16 sm:py-24";
