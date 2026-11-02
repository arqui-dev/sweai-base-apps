import type { MetadataRoute } from "next";
import { publicEnv } from "@/env.public";
import { listPosts } from "@/features/posts/posts.queries";
import { logger } from "@/shared/logger";

const STATIC_PATHS = [
  ["", 1, "weekly"],
  ["/blog", 0.9, "daily"],
  ["/coffee", 0.8, "monthly"],
  ["/subscribe", 0.7, "monthly"],
  ["/early-access", 0.7, "monthly"],
  ["/waitlist", 0.6, "monthly"],
  ["/themes", 0.5, "monthly"],
  ["/cart", 0.3, "yearly"],
  ["/login", 0.3, "yearly"],
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ([path, priority, changeFrequency]) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  // Premium posts are listed: the title and excerpt are public, only the body
  // is gated. A missing sitemap is worse than one without the newest post, so
  // a Sanity failure degrades to the static paths instead of a 500.
  try {
    for (const post of await listPosts(200)) {
      entries.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch (error: unknown) {
    logger.warn("sitemap post query failed", {
      reason: error instanceof Error ? error.message : String(error),
    });
  }

  return entries;
}
