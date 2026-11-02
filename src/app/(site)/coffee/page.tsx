import Link from "next/link";
import { CoffeeButton } from "@/components/coffee-button";
import { btn, card, section } from "@/components/ui/styles";
import { hasPremium } from "@/features/payments/entitlements.service";
import { listPosts } from "@/features/posts/posts.queries";
import { formatMoney } from "@/lib/money";
import { COFFEE } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata = {
  title: "Buy me a coffee",
  description:
    "One payment, no subscription. Unlocks every premium post on the site, for the price of a coffee.",
};

const INCLUDED = [
  "Every premium post, including the ones published later",
  "No subscription, no renewal, no card stored on this site",
  "Works without an account: we tie access to the receipt email",
] as const;

export default async function CoffeePage() {
  const [user, premium] = await Promise.all([getCurrentUser(), hasPremium()]);
  const priceLabel = formatMoney(COFFEE.unitAmount, COFFEE.currency);

  // Counting premium posts makes the offer concrete. An unreachable Sanity
  // must not take the payment page down with it.
  let premiumCount = 0;
  try {
    premiumCount = (await listPosts(50)).filter((post) => post.isPremium).length;
  } catch {
    premiumCount = 0;
  }

  return (
    <div className={`${section()} max-w-xl`}>
      <h1 className="mb-2 text-3xl">Buy me a coffee</h1>
      <p className="mb-8 text-sm text-muted">
        {priceLabel}, paid once.{" "}
        {premiumCount > 0
          ? `It unlocks the ${premiumCount} premium post${premiumCount === 1 ? "" : "s"} on this site, and every one after them.`
          : "It unlocks every premium post on this site."}
      </p>

      {premium ? (
        <div className={card()}>
          <h2 className="mb-2 text-xl">You already bought one</h2>
          <p className="mb-5 text-sm text-muted">
            Premium access is active on this account. Thank you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/blog" className={btn()}>
              Read the premium posts
            </Link>
            <Link href="/cart" className={btn("ghost")}>
              Buy another one anyway
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={card()}>
            <ul className="mb-6 grid gap-2 text-sm">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-accent">
                    &rarr;
                  </span>
                  <span className="text-muted">{item}</span>
                </li>
              ))}
            </ul>

            <CoffeeButton needsEmail={!user}>Pay {priceLabel}</CoffeeButton>

            <p className="mt-4 text-xs text-muted">
              Payment runs on Stripe Checkout. Card details never reach this site.
            </p>
          </div>

          <p className="mt-6 text-sm text-muted">
            Feeling generous? The <Link href="/cart" className="text-accent underline">cart</Link>{" "}
            takes more than one.{" "}
            {!user && (
              <>
                Already paid?{" "}
                <Link href="/login?next=/coffee" className="text-accent underline">
                  Sign in
                </Link>{" "}
                with that email to restore access.
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
