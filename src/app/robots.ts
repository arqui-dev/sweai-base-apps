import type { MetadataRoute } from "next";
import { publicEnv } from "@/env.public";

export default function robots(): MetadataRoute.Robots {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Editor, personal pages and write endpoints. None of them should ever
        // appear in a search result, and /unsubscribe carries a signed token.
        disallow: ["/api/", "/auth/", "/studio", "/profile", "/unsubscribe", "/success"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
