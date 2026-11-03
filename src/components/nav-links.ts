/**
 * Every page a visitor can navigate to, grouped for the menu. Single source:
 * the header and the hamburger panel both read this.
 *
 * `as const` is load-bearing: `typedRoutes` checks each `href` against the
 * generated route union, so a renamed page fails the typecheck here instead of
 * shipping a dead link.
 *
 * Deliberately absent, because arriving at one by clicking makes no sense:
 * `/success` only follows a Stripe redirect, `/unsubscribe` needs a signed
 * token from an email, and `/auth/*` and `/api/*` are not pages.
 */

/** Shown inline in the header on wider screens. A subset, by design. */
export const PRIMARY_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/subscribe", label: "Newsletter" },
  { href: "/early-access", label: "Early access" },
  { href: "/themes", label: "Designs" },
  { href: "/coffee", label: "Buy a coffee" },
  { href: "/cart", label: "Cart" },
] as const;

/** The full list, shown in the hamburger panel at every screen size. */
export const NAV_GROUPS = [
  {
    title: "Read",
    links: [
      { href: "/", label: "Home" },
      { href: "/blog", label: "Blog" },
      { href: "/themes", label: "Designs" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/coffee", label: "Buy a coffee" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Join",
    links: [
      { href: "/subscribe", label: "Newsletter" },
      { href: "/waitlist", label: "Waitlist" },
      { href: "/early-access", label: "Early access" },
    ],
  },
] as const;

export type NavLink = (typeof PRIMARY_LINKS)[number];
export type NavGroup = (typeof NAV_GROUPS)[number];
