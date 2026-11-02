import { THEME_COOKIE, type ThemeId } from "./themes";

/**
 * Sets the attribute the CSS reads, then persists the choice so the server
 * renders the same theme on the next request and no flash occurs. Shared by the
 * header switcher and the design gallery.
 */
export function applyTheme(next: ThemeId): void {
  document.documentElement.dataset.theme = next;
  document.cookie = `${THEME_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
}
