import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/nextjs-vite";

/**
 * Storybook builds with Vite while the app builds with Turbopack, so Tailwind
 * needs its Vite plugin here. Without it `@import "tailwindcss"` in
 * globals.css is passed through untransformed and every utility class is a
 * no-op, which looks like a broken component rather than a missing plugin.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-vitest", "@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/nextjs-vite",
  // No staticDirs: `public/` holds nothing the stories use, and it is not
  // tracked by git because it is empty, so pointing at it fails a fresh clone.
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
