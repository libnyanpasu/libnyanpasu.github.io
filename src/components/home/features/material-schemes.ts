import { createMd3ThemeOptionsCss } from "starlight-theme-md3";

/**
 * Material 3 schemes for the seed colours offered by the Material You card.
 *
 * Built at render time with the same generator that themes the site (`createMd3ThemeOptionsCss`,
 * tonal spot), so a swatch shows exactly what the page would look like with that seed. The
 * generator only emits CSS, so the two blocks it writes (dark on `:root`, light on
 * `[data-theme='light']`) are read back into `--md-sys-color-*` maps.
 */

export type Scheme = Record<string, string>;
export type SchemePair = Record<"light" | "dark", Scheme>;

// The client's theme presets (theme-color-config.tsx); the first is the site's own seed.
export const SEEDS = [
  "#3e64a7",
  "#066b9e",
  "#fa89af",
  "#d490ff",
  "#33ccbb",
  "#61cb93",
  "#f3a81e",
  "#ff9565",
];

function readBlock(block: string): Scheme {
  const scheme: Scheme = {};
  for (const [, name, value] of block.matchAll(/(--md-sys-color-[a-z-]+):\s*([^;]+);/g)) {
    scheme[name] = value.trim();
  }
  return scheme;
}

export function buildSchemes(seeds = SEEDS): Record<string, SchemePair> {
  return Object.fromEntries(
    seeds.map((seed) => {
      const css = createMd3ThemeOptionsCss({ seed });
      const split = css.indexOf("[data-theme='light']");
      return [seed, { dark: readBlock(css.slice(0, split)), light: readBlock(css.slice(split)) }];
    }),
  );
}
