import { NotFoundContent } from "@/components/not-found-content";
import { section } from "@/components/ui/styles";

export const metadata = { title: "Not found" };

/** Handles `notFound()` thrown from inside the site shell, keeping the nav. */
export default function SiteNotFound() {
  return (
    <div className={`${section()} max-w-xl`}>
      <NotFoundContent />
    </div>
  );
}
