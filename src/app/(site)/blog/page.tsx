import Link from "next/link";
import { Suspense } from "react";
import { card, section } from "@/components/ui/styles";
import { listPosts } from "@/features/posts/posts.queries";
import type { PostSummary } from "@/features/posts/posts.types";
import { formatMoney } from "@/lib/money";
import { COFFEE } from "@/lib/stripe";
import { logger } from "@/shared/logger";
import { reasonOf } from "@/shared/reason";

export const metadata = { title: "Blog" };

export default function BlogPage() {
  const priceLabel = formatMoney(COFFEE.unitAmount, COFFEE.currency);

  return (
    <div className={section()}>
      <h1 className="mb-2 text-3xl">Writing</h1>
      <p className="mb-10 text-sm text-muted">
        Free posts are open. Premium posts open for {priceLabel}, paid once.
      </p>
      <Suspense fallback={<PostListSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  );
}

/**
 * ponytail: the skeleton lives here as a Suspense fallback, not in a
 * loading.tsx. A loading file in `blog/` also covers `blog/[slug]`, which
 * forced that route to stream: headers flushed early, so a `notFound()` came
 * back as 200 instead of 404 and an error as 200 instead of 500.
 */
function PostListSkeleton() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2" aria-busy="true" aria-live="polite">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className={card()}>
          <div className="mb-3 h-3 w-24 bg-border" />
          <div className="mb-2 h-5 w-3/4 bg-border" />
          <div className="h-3 w-full bg-border" />
        </li>
      ))}
    </ul>
  );
}

async function PostList() {
  let posts: readonly PostSummary[] = [];
  let loadFailed = false;
  try {
    posts = await listPosts(50);
  } catch (error: unknown) {
    logger.error("blog post query failed", { reason: reasonOf(error) });
    loadFailed = true;
  }

  return (
    <>
      {loadFailed && (
        <p role="alert" className={card()}>
          The content API is unreachable. Check NEXT_PUBLIC_SANITY_PROJECT_ID.
        </p>
      )}

      {!loadFailed && posts.length === 0 && (
        <p className={card()}>
          No posts yet. Create one in the{" "}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/studio" className="text-accent underline">
            Studio
          </a>
          .
        </p>
      )}

      <ul className="grid gap-5 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post._id}>
            <Link href={`/blog/${post.slug}`} className={`${card()} block h-full`}>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <span>·</span>
                <span>{post.readingMinutes} min</span>
                {post.isPremium && <span className="text-accent">· Premium</span>}
              </div>
              <h2 className="mb-2 text-lg">{post.title}</h2>
              <p className="text-sm text-muted">{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
