import { cookies } from "next/headers";
import { Nav } from "@/components/nav";
import { DEFAULT_THEME, isThemeId, THEME_COOKIE } from "@/components/theme/themes";

/**
 * The public site shell. Sanity Studio sits outside this group so it keeps its
 * own full-viewport chrome instead of rendering inside our header and footer.
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
          {/* Full page load on purpose: Studio is a separate client app with its
              own chrome, and a soft navigation would prefetch its whole bundle. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/studio" className="ms-auto hover:text-ink">
            Studio
          </a>
          <span>Architecture docs: docs/arc42</span>
        </div>
      </footer>
    </>
  );
}
