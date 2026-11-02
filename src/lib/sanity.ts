import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { createClient } from "@sanity/client";
import { publicEnv } from "@/env.public";

/**
 * Content is read with @sanity/client directly rather than next-sanity. The
 * wrapper's only remaining value here was the embedded Studio component, and
 * it pulled the whole `sanity` editor package into the production dependency
 * tree with it. @sanity/client supports the Next `cache` and `next` fetch
 * options natively, which is all the queries in posts.queries.ts use.
 */
export const sanityClient = createClient({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01",
  useCdn: true,
});

const builder = createImageUrlBuilder(sanityClient);

export const imageUrl = (source: SanityImageSource, width = 1200): string =>
  builder.image(source).width(width).fit("max").auto("format").url();
