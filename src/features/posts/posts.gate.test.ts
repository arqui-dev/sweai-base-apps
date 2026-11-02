import { describe, expect, it } from "vitest";
import { assertNoLeak, isLocked } from "./posts.gate";
import type { Post } from "./posts.types";

const basePost: Post = {
  _id: "1",
  title: "Premium post",
  slug: "premium-post",
  excerpt: "Teaser",
  publishedAt: "2026-01-01T00:00:00Z",
  readingMinutes: 4,
  isPremium: true,
  coverImage: null,
  tags: [],
  body: null,
  locked: true,
};

describe("isLocked", () => {
  it("opens free posts to everyone", () => {
    expect(isLocked({ isPremium: false }, false)).toBe(false);
  });

  it("locks premium posts for readers without an entitlement", () => {
    expect(isLocked({ isPremium: true }, false)).toBe(true);
  });

  it("opens premium posts once the coffee is paid", () => {
    expect(isLocked({ isPremium: true }, true)).toBe(false);
  });
});

describe("assertNoLeak", () => {
  it("accepts a locked post with no body", () => {
    expect(() => assertNoLeak(basePost)).not.toThrow();
  });

  it("throws if a locked post ever carries a body", () => {
    const leaked: Post = { ...basePost, body: [{ _type: "block", children: [] }] };
    expect(() => assertNoLeak(leaked)).toThrow(/leaked/);
  });
});
