import Link from "next/link";
import { btn, card, section } from "@/components/ui/styles";
import { safeNextPath } from "@/shared/safe-url";

export const metadata = { title: "Thank you" };

export default async function SuccessPage({ searchParams }: PageProps<"/success">) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "/blog");

  return (
    <div className={`${section()} max-w-xl`}>
      <div className={card()}>
        <h1 className="mb-3 text-3xl">Thank you for the coffee</h1>
        <p className="mb-6 text-sm text-muted">
          Stripe confirms the payment to our webhook, which grants premium access to the email on
          the receipt. It usually lands in a second or two. If the post still looks locked, reload
          once, and sign in with that same email if you checked out as a guest.
        </p>
        <div className="flex flex-wrap gap-3">
          {/* Plain anchor: `next` is request data, so it has no typed route. */}
          <a href={next} className={btn()}>
            Continue reading
          </a>
          <Link href="/profile" className={btn("ghost")}>
            Check my access
          </Link>
        </div>
      </div>
    </div>
  );
}
