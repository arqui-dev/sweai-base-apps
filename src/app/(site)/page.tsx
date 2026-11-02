import Link from "next/link";
import { CoffeeButton } from "@/components/coffee-button";
import { EmailCapture } from "@/components/email-capture";
import { THEMES } from "@/components/theme/themes";
import { btn, card, section } from "@/components/ui/styles";
import { listPosts } from "@/features/posts/posts.queries";
import { COFFEE } from "@/lib/stripe";
import { formatMoney } from "@/lib/money";
import { getCurrentUser } from "@/lib/supabase/server";
import type { PostSummary } from "@/features/posts/posts.types";

const SERVICES = [
  {
    title: "Platform review",
    body: "Two weeks across your Terraform, clusters and pipelines. You get a ranked findings list and the diffs to fix the top five.",
  },
  {
    title: "Architecture documentation",
    body: "arc42 plus C4 diagrams generated from the real repository, not from a whiteboard session nobody updates.",
  },
  {
    title: "AI engineering setup",
    body: "Agent definitions, guardrails and CI checks so the team ships with assistants instead of around them.",
  },
] as const;

export default async function LandingPage() {
  const user = await getCurrentUser();
  const priceLabel = formatMoney(COFFEE.unitAmount, COFFEE.currency);

  // Posts are optional on the landing page: an empty Sanity dataset must not
  // break the hero.
  let posts: readonly PostSummary[] = [];
  try {
    posts = (await listPosts(3)).slice(0, 3);
  } catch {
    posts = [];
  }

  return (
    <>
      <section className={section()}>
        <p className="mb-4 text-xs tracking-widest text-muted uppercase">
          Platform &amp; architecture engineering
        </p>
        <h1 className="max-w-3xl text-4xl leading-tight sm:text-6xl">
          Hire the engineer who writes the documentation too.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Fixed-scope engagements on infrastructure, delivery pipelines and architecture docs. The
          write-ups live on this site. The premium ones cost one coffee.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/early-access" className={btn()}>
            Book an engagement
          </Link>
          <Link href="/blog" className={btn("ghost")}>
            Read the posts
          </Link>
        </div>
      </section>

      <section className={`${section()} pt-0`} aria-labelledby="services">
        <h2 id="services" className="mb-8 text-2xl">
          What you can hire
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {SERVICES.map((service) => (
            <article key={service.title} className={card()}>
              <h3 className="mb-2 text-lg">{service.title}</h3>
              <p className="text-sm text-muted">{service.body}</p>
            </article>
          ))}
        </div>
      </section>

      {posts.length > 0 && (
        <section className={`${section()} pt-0`} aria-labelledby="latest">
          <h2 id="latest" className="mb-8 text-2xl">
            Latest writing
          </h2>
          <ul className="grid gap-5 sm:grid-cols-3">
            {posts.map((post) => (
              <li key={post._id}>
                <Link href={`/blog/${post.slug}`} className={`${card()} block h-full`}>
                  <h3 className="mb-2 text-base">{post.title}</h3>
                  <p className="text-sm text-muted">{post.excerpt}</p>
                  <p className="mt-3 text-xs text-accent">
                    {post.isPremium ? `Premium: ${priceLabel}` : "Free"} ·{" "}
                    {post.readingMinutes} min
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={`${section()} pt-0`} aria-labelledby="coffee">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className={card()}>
            <h2 id="coffee" className="mb-2 text-xl">
              Buy a coffee
            </h2>
            <p className="mb-5 text-sm text-muted">
              {priceLabel} once. Unlocks every premium post, forever, with no subscription.
            </p>
            <CoffeeButton needsEmail={!user} />
          </div>

          <div className={card()}>
            <h2 className="mb-2 text-xl">Get the newsletter</h2>
            <p className="mb-5 text-sm text-muted">
              One mail per published post. Nothing else, and one click to leave.
            </p>
            <EmailCapture endpoint="/api/newsletter" payload={{ source: "landing" }} />
          </div>
        </div>
      </section>

      <section className={`${section()} pt-0`} aria-labelledby="themes">
        <h2 id="themes" className="mb-3 text-2xl">
          Five skins, one component tree
        </h2>
        <p className="mb-8 max-w-2xl text-sm text-muted">
          Switch with the control in the header. Each preset is a block of CSS custom properties, so
          no component knows which theme is active.
        </p>
        <ul className="grid gap-4 sm:grid-cols-3">
          {THEMES.map((theme) => (
            <li key={theme.id} className={card()}>
              <h3 className="mb-1 text-base">{theme.label}</h3>
              <p className="text-sm text-muted">{theme.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
