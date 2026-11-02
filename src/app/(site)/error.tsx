"use client";

import Link from "next/link";
import { useEffect } from "react";
import { btn, card, section } from "@/components/ui/styles";

/**
 * Catches render-time failures in the site shell. `assertNoLeak` throwing is
 * the one we actually expect to see: a premium body that reached a locked post.
 * That must surface as this page, never as a partially rendered post.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The message is already in the server log. This records the client-side
    // digest so the two can be matched when someone reports a broken page.
    console.error(JSON.stringify({ level: "error", message: "render failed", digest: error.digest }));
  }, [error.digest]);

  return (
    <div className={`${section()} max-w-xl`}>
      <div className={card()}>
        <h1 className="mb-3 text-3xl">Something broke on our side</h1>
        <p className="mb-6 text-sm text-muted">
          Nothing you did caused this, and nothing was charged. Reloading often works, because most
          of these are a failed call to one of the services behind the site.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={reset} className={btn()}>
            Try again
          </button>
          <Link href="/" className={btn("ghost")}>
            Back to the landing page
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 font-mono text-xs text-muted">reference: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
