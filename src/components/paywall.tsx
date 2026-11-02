import Link from "next/link";
import { CoffeeButton } from "@/components/coffee-button";
import { card } from "@/components/ui/styles";

/** Shown in place of a premium body. Carries no part of the locked content. */
export function Paywall({
  slug,
  priceLabel,
  isSignedIn,
}: {
  slug: string;
  priceLabel: string;
  isSignedIn: boolean;
}) {
  return (
    <aside className={`${card()} mt-8`} aria-labelledby="paywall-heading">
      <h2 id="paywall-heading" className="text-xl">
        One coffee unlocks this
      </h2>
      <p className="mt-2 mb-5 text-sm text-muted">
        {priceLabel}, paid once. It opens this post and every other premium post, with no
        subscription and no card stored here.
      </p>
      <CoffeeButton slug={slug} needsEmail={!isSignedIn}>
        Unlock for {priceLabel}
      </CoffeeButton>
      <p className="mt-4 text-xs text-muted">
        <Link href="/coffee" className="text-accent underline">
          What a coffee unlocks
        </Link>
      </p>
      {!isSignedIn && (
        <p className="mt-4 text-xs text-muted">
          Already paid?{" "}
          <Link href={`/login?next=/blog/${slug}`} className="text-accent underline">
            Sign in with that email
          </Link>{" "}
          to restore access.
        </p>
      )}
    </aside>
  );
}
