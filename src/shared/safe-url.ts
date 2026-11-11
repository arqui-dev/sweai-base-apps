/**
 * Scheme allowlist for any href whose value came from outside this codebase.
 *
 * React renders `href` verbatim and does not block `javascript:` URLs, so a
 * link stored in the CMS is a stored-XSS sink until something checks its
 * scheme. This is that check (OWASP A05, CWE-79).
 */
const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:"]);

export function safeHref(value: unknown): string {
  if (typeof value !== "string") return "#";

  const trimmed = value.trim();
  if (trimmed === "") return "#";

  // Same-document and same-origin paths. "//host" is protocol-relative and
  // therefore external, so it has to go through the URL parser instead.
  if (trimmed.startsWith("#")) return trimmed;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return SAFE_SCHEMES.has(url.protocol) ? url.toString() : "#";
  } catch {
    return "#";
  }
}

/**
 * Sanitizes a redirect target that came from a request.
 *
 * `value.startsWith("/")` is not enough and three call sites used it anyway.
 * `new URL("//evil.test", origin)` resolves to `https://evil.test/`, and a
 * browser normalizes `/\evil.test` the same way, so both pass a naive prefix
 * check and leave the origin (CWE-601).
 */
export function safeNextPath(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return fallback;
  // Protocol-relative and the backslash variant are both off-origin.
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return fallback;
  // A control character can be stripped by the browser and change the target.
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return fallback;

  return trimmed;
}
