import { groq } from "next-sanity";
import { sanityClient } from "@/lib/sanity";
import { isLocked } from "./posts.gate";
import type { Post, PostSummary } from "./posts.types";

const SUMMARY_FIELDS = groq`
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "readingMinutes": round(length(pt::text(body)) / 5 / 180) + 1,
  "isPremium": coalesce(isPremium, false),
  "coverImage": coverImage,
  "tags": coalesce(tags, [])
`;

const LIST_QUERY = groq`*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]
  | order(publishedAt desc)[0...$limit]{ ${SUMMARY_FIELDS} }`;

/**
 * The body is resolved by Sanity only when the post is free or the reader paid.
 * For a locked post it comes back as null, so the premium text never reaches
 * this process, let alone the browser.
 */
const POST_QUERY = groq`*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
  ${SUMMARY_FIELDS},
  "body": select(coalesce(isPremium, false) == false || $entitled == true => body, null)
}`;

export async function listPosts(limit = 20): Promise<readonly PostSummary[]> {
  return sanityClient.fetch<PostSummary[]>(
    LIST_QUERY,
    { limit },
    { next: { revalidate: 60, tags: ["post"] } },
  );
}

export async function getPost(slug: string, hasPremium: boolean): Promise<Post | null> {
  const raw = await sanityClient.fetch<(PostSummary & { body: Post["body"] }) | null>(
    POST_QUERY,
    { slug, entitled: hasPremium },
    { next: { revalidate: 60, tags: ["post", `post:${slug}`] } },
  );
  if (!raw) return null;

  return { ...raw, locked: isLocked(raw, hasPremium) };
}
