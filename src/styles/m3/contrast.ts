// Pure color math for the color system (generate.ts) and its tests: no Mantine and no DOM. The
// formulas are WCAG's (luminance, contrast) and CSS color-mix's (mix), on #rrggbb hex.

const channels = (hex: string) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
const linear = (value: number) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const toHex = (values: number[]) => `#${values.map((v) => v.toString(16).padStart(2, '0')).join('')}`;

/** WCAG relative luminance of a #rrggbb color. */
export function luminanceOf(hex: string) {
  const [r, g, b] = channels(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast between two #rrggbb colors. */
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminanceOf(a), luminanceOf(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Contrast of white text on the color. */
export const whiteContrast = (hex: string) => 1.05 / (luminanceOf(hex) + 0.05);

/** `color` at `weight` (0–1) over `under`, as CSS color-mix in srgb: an opaque layer of the color on a surface. */
export const mixHex = (color: string, under: string, weight: number) => {
  const base = channels(under);
  return toHex(channels(color).map((v, i) => Math.round(v * weight + base[i] * (1 - weight))));
};

/** The label Mantine's autoContrast puts on a fill: black on a light color (luminance over 0.179), else white. */
export const contrastText = (hex: string) => (luminanceOf(hex) > 0.179 ? '#000000' : '#FFFFFF');
