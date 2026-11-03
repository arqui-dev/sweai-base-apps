import Link from "next/link";
import { PRIMARY_LINKS } from "@/components/nav-links";
import { SiteMenu } from "@/components/site-menu";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import type { ThemeId } from "@/components/theme/themes";
import { btn } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/supabase/server";

export async function Nav({ theme }: { theme: ThemeId }) {
  const user = await getCurrentUser();

  const account = user ? (
    <Link href="/profile" className="hover:text-accent text-sm">
      {user.email}
    </Link>
  ) : (
    <Link href="/login" className={btn("ghost")}>
      Sign in
    </Link>
  );

  return (
    <header className="border-b-(length:--border-width) border-border bg-bg">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-5xl items-center gap-4 px-5 py-4"
      >
        <Link href="/" className="font-display text-base">
          Hire Service
        </Link>

        <ul className="text-muted hidden gap-4 text-sm sm:flex">
          {PRIMARY_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-ink">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ms-auto flex items-center gap-3">
          <ThemeSwitcher current={theme} />
          <div className="hidden sm:block">{account}</div>
          <SiteMenu account={account} />
        </div>
      </nav>
    </header>
  );
}
