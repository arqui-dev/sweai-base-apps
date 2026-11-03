import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = import.meta.dirname;

/**
 * Two projects, one command.
 *
 * `node` runs the unit tests: schemas, the paywall gate, config detection,
 * contrast parsed out of themes.css.
 *
 * `storybook` runs every story as a browser test, with the a11y addon set to
 * `error`. That is what makes the component catalogue load-bearing rather than
 * decorative: a component that stops rendering, or grows an accessibility
 * violation, fails `npm run test`.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "node", environment: "node", include: ["src/**/*.test.ts"] },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: `${dirname}/.storybook` })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
