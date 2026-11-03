import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { THEMES } from "../src/components/theme/themes";
import "../src/app/globals.css";
import "./storybook.css";

/**
 * The theme toolbar is the point of this setup. A component here reads only
 * CSS custom properties, so switching `data-theme` on the wrapper re-skins
 * every story without touching a prop. If a story looks wrong in one theme and
 * right in another, the component is reaching past its tokens.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "minimalist";
  return (
    <div data-theme={theme} className="bg-bg text-ink min-h-dvh p-6 antialiased">
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Theme tokens applied to the story",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: THEMES.map((t) => ({ value: t.id, title: t.label })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "minimalist" },
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Stories are also the a11y suite: `error` fails `npm run test` on a
    // violation instead of leaving it in a panel nobody opens.
    a11y: { test: "error" },
  },
};

export default preview;
