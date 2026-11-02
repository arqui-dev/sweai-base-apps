const REPLACEMENTS: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * For interpolating untrusted values into outbound HTML email. React escapes
 * JSX for us, but a template literal building an email body does not, and the
 * capture forms let one person choose both the recipient address and the name
 * rendered in the message (OWASP A05, CWE-79).
 */
export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => REPLACEMENTS[c] ?? c);
