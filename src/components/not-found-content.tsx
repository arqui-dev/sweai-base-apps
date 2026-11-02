import Link from "next/link";
import { btn, card } from "@/components/ui/styles";

/**
 * Shared by the root `not-found.tsx`, which catches unmatched URLs, and the
 * `(site)` one, which catches `notFound()` from inside the site shell. Two
 * files are required because a route group cannot handle a path that matched
 * no segment at all.
 */
export function NotFoundContent() {
  return (
    <div className={card()}>
      <h1 className="mb-3 text-3xl">That page does not exist</h1>
      <p className="mb-6 text-sm text-muted">
        A post may have been renamed, or the link may have been typed by hand. The blog index is
        the fastest way to find it again.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/blog" className={btn()}>
          Browse the posts
        </Link>
        <Link href="/" className={btn("ghost")}>
          Back to the landing page
        </Link>
      </div>
    </div>
  );
}
