export const metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

/** Studio needs the full viewport, so it opts out of the site shell. */
export const dynamic = "force-static";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
