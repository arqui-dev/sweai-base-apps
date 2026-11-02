"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

/**
 * Client component on purpose. The `sanity` package has no React Server
 * Components build, so importing the config from the server graph breaks the
 * build. Studio is an editor behind auth; shipping it client-only costs nothing.
 */
export default function StudioPage() {
  return <NextStudio config={config} />;
}
