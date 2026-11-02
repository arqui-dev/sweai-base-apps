import Link from "next/link";
import { btn, card, section } from "@/components/ui/styles";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className={`${section()} max-w-xl`}>
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
    </div>
  );
}
