import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { createClient } from "next-sanity";
import { publicEnv } from "@/env.public";

export const sanityClient = createClient({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01",
  useCdn: true,
});

const builder = createImageUrlBuilder(sanityClient);

export const imageUrl = (source: SanityImageSource, width = 1200): string =>
  builder.image(source).width(width).fit("max").auto("format").url();
