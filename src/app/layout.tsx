import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { cookies } from "next/headers";
import { DEFAULT_THEME, isThemeId, THEME_COOKIE } from "@/components/theme/themes";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const displaySerif = Instrument_Serif({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: { default: "Hire Service", template: "%s · Hire Service" },
  description:
    "Platform and architecture work, billed by the engagement. Read the posts, buy a coffee for the premium ones.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Server-rendered theme means no flash of the wrong palette on first paint.
  const theme = (await cookies()).get(THEME_COOKIE)?.value;
  const active = isThemeId(theme) ? theme : DEFAULT_THEME;

  return (
    <html
      lang="en"
      data-theme={active}
      className={`${geistSans.variable} ${geistMono.variable} ${displaySerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
