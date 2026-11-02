import { notFound } from "next/navigation";
import Image from "next/image";
import { Paywall } from "@/components/paywall";
import { PostBody } from "@/components/post-body";
import { section } from "@/components/ui/styles";
import { hasPremium } from "@/features/payments/entitlements.service";
import { assertNoLeak } from "@/features/posts/posts.gate";
import { getPost } from "@/features/posts/posts.queries";
import { formatMoney } from "@/lib/money";
import { imageUrl } from "@/lib/sanity";
import { COFFEE } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase/server";
import { logger } from "@/shared/logger";
import { reasonOf } from "@/shared/reason";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug, false).catch((error: unknown) => {
    logger.warn("post metadata query failed", { slug, reason: reasonOf(error) });
    return null;
  });
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;

  const [premium, user] = await Promise.all([hasPremium(), getCurrentUser()]);
  const post = await getPost(slug, premium);
  if (!post) notFound();

  assertNoLeak(post);

  return (
    <article className={`${section()} max-w-2xl`}>
      <div className="mb-3 flex items-center gap-2 text-xs text-muted">
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <span>·</span>
        <span>{post.readingMinutes} min read</span>
        {post.isPremium && <span className="text-accent">· Premium</span>}
      </div>

      <h1 className="text-4xl leading-tight">{post.title}</h1>
      <p className="mt-4 text-lg text-muted">{post.excerpt}</p>

      {post.coverImage && (
        <Image
          src={imageUrl(post.coverImage, 1200)}
          alt=""
          width={1200}
          height={630}
          priority
          className="mt-8 h-auto w-full rounded-(--radius)"
        />
      )}

      {post.body ? (
        <PostBody value={post.body} />
      ) : (
        <Paywall
          slug={post.slug}
          priceLabel={formatMoney(COFFEE.unitAmount, COFFEE.currency)}
          isSignedIn={Boolean(user)}
        />
      )}
    </article>
  );
}
