import Link from "next/link";
import { card, section } from "@/components/ui/styles";
import { listPosts } from "@/features/posts/posts.queries";
import type { PostSummary } from "@/features/posts/posts.types";
import { formatMoney } from "@/lib/money";
import { COFFEE } from "@/lib/stripe";

export const metadata = { title: "Blog" };

export default async function BlogPage() {
  const priceLabel = formatMoney(COFFEE.unitAmount, COFFEE.currency);

  let posts: readonly PostSummary[] = [];
  let loadFailed = false;
  try {
    posts = await listPosts(50);
  } catch {
    loadFailed = true;
  }

  return (
    <div className={section()}>
      <h1 className="mb-2 text-3xl">Writing</h1>
      <p className="mb-10 text-sm text-muted">
        Free posts are open. Premium posts open for {priceLabel}, paid once.
      </p>

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
    </div>
  );
}
