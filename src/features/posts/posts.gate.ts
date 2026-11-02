import type { Post, PostSummary } from "./posts.types";

/**
 * The read rule, in one place: free posts are open, premium posts need a
 * coffee. Called by the page and by the test; nothing else decides this.
 */
export const isLocked = (post: Pick<PostSummary, "isPremium">, hasPremium: boolean): boolean =>
  post.isPremium && !hasPremium;

/** Defense in depth: a locked post must never carry a body. */
export const assertNoLeak = (post: Post): void => {
  if (post.locked && post.body !== null) {
    throw new Error(`Premium body leaked for post ${post.slug}`);
  }
};
