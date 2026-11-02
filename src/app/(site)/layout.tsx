import { cookies } from "next/headers";
import { Nav } from "@/components/nav";
import { DEFAULT_THEME, isThemeId, THEME_COOKIE } from "@/components/theme/themes";
import { publicEnv } from "@/env.public";

/**
 * The public site shell. Every page lives in this group; the Studio is hosted
 * by Sanity on its own domain and is linked, not rendered.
 */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const theme = (await cookies()).get(THEME_COOKIE)?.value;
  const active = isThemeId(theme) ? theme : DEFAULT_THEME;

  return (
    <>
      <Nav theme={active} />
      <main className="flex-1">{children}</main>
      <footer className="border-t-(length:--border-width) border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-4 px-5 py-8 text-xs text-muted">
          <span>Hire Service: a study base, not a real company.</span>
          {publicEnv.NEXT_PUBLIC_SANITY_STUDIO_URL && (
            <a
              href={publicEnv.NEXT_PUBLIC_SANITY_STUDIO_URL}
              rel="noopener noreferrer"
              target="_blank"
              className="ms-auto hover:text-ink"
            >
              Studio
            </a>
          )}
          <span>Architecture docs: docs/arc42</span>
        </div>
      </footer>
    </>
  );
}
