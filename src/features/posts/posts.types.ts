import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";

export type PostSummary = {
  readonly _id: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly publishedAt: string;
  readonly readingMinutes: number;
  readonly isPremium: boolean;
  readonly coverImage: SanityImageSource | null;
  readonly tags: readonly string[];
};

export type Post = PostSummary & {
  /** Null when the post is premium and the reader has not paid. */
  readonly body: readonly PortableTextBlock[] | null;
  readonly locked: boolean;
};
