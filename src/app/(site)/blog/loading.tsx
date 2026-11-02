import { card, section } from "@/components/ui/styles";

/** Posts come from Sanity on request, so navigation needs something to show. */
export default function BlogLoading() {
  return (
    <div className={section()} aria-busy="true" aria-live="polite">
      <h1 className="mb-2 text-3xl">Writing</h1>
      <p className="mb-10 text-sm text-muted">Loading posts...</p>
      <ul className="grid gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className={card()}>
            <div className="mb-3 h-3 w-24 bg-border" />
            <div className="mb-2 h-5 w-3/4 bg-border" />
            <div className="h-3 w-full bg-border" />
          </li>
        ))}
      </ul>
    </div>
  );
}
