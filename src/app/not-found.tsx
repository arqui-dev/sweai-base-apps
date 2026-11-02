import { NotFoundContent } from "@/components/not-found-content";
import { section } from "@/components/ui/styles";

export const metadata = { title: "Not found" };

/**
 * Unmatched URLs never enter the `(site)` group, so a not-found file inside it
 * cannot catch them. Without this file Next serves its own unstyled 404.
 */
export default function RootNotFound() {
  return (
    <div className={`${section()} max-w-xl`}>
      <NotFoundContent />
    </div>
  );
}
