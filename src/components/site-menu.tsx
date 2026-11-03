import Link from "next/link";
import { NAV_GROUPS } from "@/components/nav-links";

const MENU_ID = "site-menu";

/**
 * Hamburger menu listing every navigable page.
 *
 * ponytail: built on the Popover API, so there is no JavaScript here and no
 * client component. The browser gives light dismiss (Escape and click
 * outside), top-layer stacking, focus handling, and an implicit
 * `aria-expanded` on the invoker. A hand-written disclosure would be 60 lines
 * of state, refs and key handlers to arrive at the same behaviour, with worse
 * edge cases. `<details>` was the other option and loses light dismiss.
 */
export function SiteMenu({
  account,
}: {
  /** Rendered at the bottom of the panel: sign in, or the signed-in email. */
  account: React.ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        popoverTarget={MENU_ID}
        aria-label="All pages"
        className="text-ink hover:text-accent flex size-9 items-center justify-center rounded-(--radius)"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          className="size-5"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <nav id={MENU_ID} popover="auto" aria-label="All pages" className="site-menu-panel">
        <div className="flex items-center justify-between gap-4 border-b-(length:--border-width) border-border px-5 py-4">
          <span className="font-display text-base">All pages</span>
          <button
            type="button"
            popoverTarget={MENU_ID}
            popoverTargetAction="hide"
            aria-label="Close menu"
            className="text-muted hover:text-ink text-sm"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 px-5 py-5">
          {NAV_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="text-muted mb-2 text-xs tracking-widest uppercase">{group.title}</h2>
              <ul className="grid gap-1.5">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    <Link href={link.href} className="hover:text-accent text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="border-t-(length:--border-width) border-border px-5 py-4">{account}</div>
      </nav>
    </>
  );
}
