import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { THEMES } from "@/components/theme/themes";

/**
 * Parses themes.css and measures every colour pair against WCAG 2.2 AA. This
 * exists because the five palettes were shipped once with ten failing pairs,
 * including a primary action button at 3.35:1, and nothing caught it. A theme
 * is data, so its accessibility can be a unit test rather than a review note.
 */

const css = readFileSync(join(process.cwd(), "src/app/themes.css"), "utf8");

const hexToRgb = (hex: string): readonly [number, number, number] => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16)) as unknown as readonly [
    number,
    number,
    number,
  ];
};

const relativeLuminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
};

/** Pulls the solid colour tokens out of one `[data-theme="..."]` block. */
function tokensFor(theme: string): Record<string, string> {
  const block = new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([^}]*)\\}`).exec(css);
  if (!block?.[1]) throw new Error(`No [data-theme="${theme}"] block in themes.css`);
  return Object.fromEntries(
    [...block[1].matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [
      m[1] as string,
      m[2] as string,
    ]),
  );
}

// 4.5:1 is AA for normal text. 3:1 is AA for a UI component boundary (1.4.11).
const TEXT_PAIRS = [
  ["ink", "bg"],
  ["ink", "surface"],
  ["muted", "bg"],
  ["muted", "surface"],
  ["accent", "bg"],
  ["accent", "surface"],
  ["accent-ink", "accent"],
] as const;

const BOUNDARY_PAIRS = [
  ["field-border", "bg"],
  ["field-border", "surface"],
] as const;

const REQUIRED_TOKENS = [
  "bg",
  "surface",
  "ink",
  "muted",
  "accent",
  "accent-ink",
  "border",
  "field-border",
] as const;

describe.each(THEMES.map((t) => t.id))("theme %s", (theme) => {
  const tokens = tokensFor(theme);

  it("defines every colour token", () => {
    for (const name of REQUIRED_TOKENS) {
      expect(tokens[name], `--${name} missing, so it would inherit from :root`).toMatch(
        /^#[0-9a-fA-F]{6}$/,
      );
    }
  });

  it.each(TEXT_PAIRS)("%s on %s meets AA for text (4.5:1)", (fg, bg) => {
    const ratio = contrast(tokens[fg] as string, tokens[bg] as string);
    expect(ratio, `${theme}: --${fg} on --${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it.each(BOUNDARY_PAIRS)("%s on %s meets AA for a UI boundary (3:1)", (fg, bg) => {
    const ratio = contrast(tokens[fg] as string, tokens[bg] as string);
    expect(ratio, `${theme}: --${fg} on --${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      3,
    );
  });
});

describe("the contrast maths itself", () => {
  it("matches known WCAG reference ratios", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrast("#ffffff", "#ffffff")).toBeCloseTo(1, 2);
    expect(contrast("#767676", "#ffffff")).toBeCloseTo(4.54, 1);
  });
});
