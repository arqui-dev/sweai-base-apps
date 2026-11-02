import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import type { ThemeId } from "@/components/theme/themes";
import { getCurrentUser } from "@/lib/supabase/server";
import { btn } from "@/components/ui/styles";

const LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/subscribe", label: "Newsletter" },
  { href: "/early-access", label: "Early access" },
  { href: "/themes", label: "Designs" },
  { href: "/coffee", label: "Buy a coffee" },
  { href: "/cart", label: "Cart" },
] as const;

export async function Nav({ theme }: { theme: ThemeId }) {
  const user = await getCurrentUser();

  return (
    <header className="border-b-(length:--border-width) border-border bg-bg">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-5xl items-center gap-4 px-5 py-4"
      >
        <Link href="/" className="font-display text-base">
          Hire Service
        </Link>

        <ul className="hidden gap-4 text-sm text-muted sm:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-ink">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ms-auto flex items-center gap-3">
          <ThemeSwitcher current={theme} />
          {user ? (
            <Link href="/profile" className="text-sm hover:text-accent">
              {user.email}
            </Link>
          ) : (
            <Link href="/login" className={btn("ghost")}>
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
