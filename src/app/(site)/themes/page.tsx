import { cookies } from "next/headers";
import { ThemeCard } from "./theme-card";
import { DEFAULT_THEME, isThemeId, THEMES, THEME_COOKIE } from "@/components/theme/themes";
import { section } from "@/components/ui/styles";

export const metadata = {
  title: "Designs",
  description:
    "Five selectable designs over one component tree. Each is a block of CSS custom properties, not a fork.",
};

const TOKENS = [
  ["--bg", "Page background"],
  ["--surface", "Raised panels and cards"],
  ["--ink", "Body and heading text"],
  ["--muted", "Secondary text"],
  ["--accent", "Primary action and links"],
  ["--accent-ink", "Text on the accent"],
  ["--border", "All borders and rules"],
  ["--radius", "Corner radius everywhere"],
  ["--border-width", "Border thickness"],
  ["--shadow", "Elevation, or none"],
  ["--display-family", "Headings and display text"],
  ["--body-family", "Body text"],
  ["--display-weight", "Heading weight"],
  ["--display-transform", "Heading case"],
  ["--display-tracking", "Heading letter spacing"],
] as const;

export default async function ThemesPage() {
  const cookie = (await cookies()).get(THEME_COOKIE)?.value;
  const active = isThemeId(cookie) ? cookie : DEFAULT_THEME;

  return (
    <div className={section()}>
      <h1 className="mb-2 text-3xl">Designs</h1>
      <p className="mb-10 max-w-2xl text-sm text-muted">
        Five presets. Each preview below renders in its own theme on this page, with the same
        components the rest of the site uses. Pick one and it applies everywhere, stored in a
        cookie so the server renders it on the next request.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            id={theme.id}
            name={theme.label}
            note={theme.note}
            isActive={theme.id === active}
          />
        ))}
      </div>

      <h2 className="mt-16 mb-3 text-2xl">The tokens a design sets</h2>
      <p className="mb-6 max-w-2xl text-sm text-muted">
        A design is exactly these fifteen custom properties, defined once per theme in{" "}
        <code className="bg-surface border-(length:--border-width) border-border px-1.5 py-0.5 font-mono text-[0.9em]">
          src/app/themes.css
        </code>
        . No component names a color, so a sixth design is one CSS block and one array entry.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-md text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b-(length:--border-width) border-border">
              <th scope="col" className="py-2 pe-6 font-medium">
                Token
              </th>
              <th scope="col" className="py-2 font-medium">
                Controls
              </th>
            </tr>
          </thead>
          <tbody>
            {TOKENS.map(([token, controls]) => (
              <tr key={token} className="border-b-(length:--border-width) border-border">
                <td className="py-2 pe-6 font-mono text-xs">{token}</td>
                <td className="py-2 text-muted">{controls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
