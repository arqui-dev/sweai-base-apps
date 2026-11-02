import Link from "next/link";
import { redirect } from "next/navigation";
import { CoffeeButton } from "@/components/coffee-button";
import { EmailCapture } from "@/components/email-capture";
import { btn, card, section } from "@/components/ui/styles";
import { hasPremium } from "@/features/payments/entitlements.service";
import { unsubscribeUrl } from "@/features/newsletter/unsubscribe";
import { formatMoney } from "@/lib/money";
import { COFFEE } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  // Middleware redirects anonymous visitors; this check is the actual gate.
  if (!auth.user) redirect("/login?next=/profile");

  const premium = await hasPremium();
  const priceLabel = formatMoney(COFFEE.unitAmount, COFFEE.currency);

  const { data: subscription } = await supabase
    .from("newsletter_subscribers")
    .select("email, unsubscribed_at")
    .eq("email", auth.user.email ?? "")
    .maybeSingle();

  const isSubscribed = Boolean(subscription) && !subscription?.unsubscribed_at;

  return (
    <div className={`${section()} max-w-2xl`}>
      <h1 className="mb-8 text-3xl">Your account</h1>

      <dl className={`${card()} mb-5 grid gap-3 text-sm`}>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Email</dt>
          <dd>{auth.user.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Premium access</dt>
          <dd className={premium ? "text-accent" : undefined}>
            {premium ? "Active" : "Not yet"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Newsletter</dt>
          <dd>
            {isSubscribed ? (
              <>
                Subscribed{" "}
                {/* Signed link, same one the mail footer uses. */}
                <a
                  href={unsubscribeUrl(auth.user.email ?? "")}
                  className="text-accent underline"
                >
                  Leave
                </a>
              </>
            ) : (
              "Not subscribed"
            )}
          </dd>
        </div>
      </dl>

      {!premium && (
        <section className={`${card()} mb-5`}>
          <h2 className="mb-2 text-xl">Unlock premium posts</h2>
          <p className="mb-5 text-sm text-muted">
            {priceLabel} once, tied to this email.
          </p>
          <CoffeeButton needsEmail={false} />
        </section>
      )}

      {!isSubscribed && (
        <section className={`${card()} mb-5`}>
          <h2 className="mb-2 text-xl">Join the newsletter</h2>
          <EmailCapture endpoint="/api/newsletter" payload={{ source: "profile" }} />
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/blog" className={btn("ghost")}>
          Back to the blog
        </Link>
        <form action="/auth/signout" method="post">
          <button type="submit" className={btn("ghost")}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
