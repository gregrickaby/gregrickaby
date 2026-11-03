/** The golden ratio, about 1.618. */
export const PHI = (1 + Math.sqrt(5)) / 2

/** What browsers set the root font size to unless the reader changes it. */
export const BROWSER_DEFAULT = 16

export const RATIOS = [
  { id: 'golden', name: 'Golden ratio', value: PHI },
  { id: 'fourth', name: 'Perfect fourth', value: 4 / 3 },
  { id: 'third', name: 'Minor third', value: 1.2 },
] as const

export type Ratio = (typeof RATIOS)[number]

/** Each text style in the scale, and how many ratio steps it sits above the body. */
export const LEVELS = [
  { name: 'h1', sample: 'Heading one', step: 3 },
  { name: 'h2', sample: 'Heading two', step: 2 },
  { name: 'h3', sample: 'Heading three', step: 1 },
  { name: 'body', sample: 'Body text', step: 0 },
  { name: 'small', sample: 'Small print', step: -1 },
] as const

/** Rounds to `places` decimals and drops trailing zeros. */
export function round(value: number, places = 3): number {
  return Number(value.toFixed(places))
}

/** A pixel size for display, to a tenth: `67.8px`. */
export function formatPx(px: number): string {
  return `${round(px, 1)}px`
}

/** A pixel size in rem, against the browser's 16px root unless told otherwise. */
export function toRem(px: number, root = BROWSER_DEFAULT): string {
  return `${round(px / root)}rem`
}

/** Every level's size in pixels: the base times the ratio once per step. */
export function getScale(base: number, ratio: number) {
  return LEVELS.map((level) => ({ ...level, px: base * ratio ** level.step }))
}

/** The scale as CSS custom properties in rem, each with its pixel size in a comment. */
export function buildScaleCss(base: number, ratio: number): string {
  const lines = getScale(base, ratio).map(
    ({ px, step }) =>
      `  --step-${step < 0 ? `minus-${-step}` : step}: ${toRem(px)}; /* ${formatPx(px)} */`,
  )
  return `:root {\n${lines.join('\n')}\n}`
}

/**
 * The width a line of text reads best at, per the Golden Ratio Typography
 * formula: the font size times the golden ratio, squared.
 */
export function getGoldenWidth(fontSize: number): number {
  return (fontSize * PHI) ** 2
}

/**
 * The line height, in pixels, the Golden Ratio Typography formula picks for
 * a font size and a line width. At the golden width it's the font size times
 * 1.618; narrower lines get a little less, wider ones a little more.
 */
export function getGoldenLineHeight(fontSize: number, width: number): number {
  return fontSize * (PHI - (1 / (2 * PHI)) * (1 - width / getGoldenWidth(fontSize)))
}

/** The font size whose golden width is `width`: the inverse of `getGoldenWidth`. */
export function getGoldenFontSize(width: number): number {
  return Math.sqrt(width) / PHI
}

/**
 * The line width that makes `lineHeight` golden for a font size: the line
 * height formula solved for the width. Rounding a line height to a whole
 * pixel moves the width that suits it, and this finds the new one.
 */
export function getTunedWidth(fontSize: number, lineHeight: number): number {
  return getGoldenWidth(fontSize) * (1 - 2 * PHI * (PHI - lineHeight / fontSize))
}

/** A fluid size between two screen widths, held at `min` and `max` outside them. */
export interface Fluid {
  min: number
  max: number
  from: number
  to: number
}

/** The size a fluid value renders at on a screen `screen` pixels wide. */
export function getFluidSize({ from, max, min, to }: Fluid, screen: number): number {
  const slope = (max - min) / (to - from)
  return Math.min(Math.max(min + slope * (screen - from), min), max)
}

/** The `clamp()` that grows from `min` to `max` pixels between the two screen widths. */
export function buildClamp({ from, max, min, to }: Fluid): string {
  const slope = (max - min) / (to - from)
  const intercept = min - slope * from
  return `clamp(${toRem(min)}, ${toRem(intercept)} + ${round(slope * 100)}vw, ${toRem(max)})`
}
