import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schema";

/**
 * Studio is served from the app itself at /studio. One deploy ships the site
 * and the editor, and the content schema stays in version control.
 */
export default defineConfig({
  name: "hire-service",
  title: "Hire Service",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
