import {
  formatPx,
  getGoldenFontSize,
  getGoldenLineHeight,
  getGoldenWidth,
  getTunedWidth,
  PHI,
  round,
  toRem,
} from './scale'

/**
 * The calculator's text styles, each a power of the golden ratio above or
 * below the body. Half steps (the square root of 1.618) keep four heading
 * levels from climbing as steeply as whole steps would.
 */
export const TYPE_LEVELS = [
  { name: 'h1', power: 2 },
  { name: 'h2', power: 1.5 },
  { name: 'h3', power: 1 },
  { name: 'h4', power: 0.5 },
  { name: 'body', power: 0 },
  { name: 'small', power: -0.5 },
] as const

/** Spacing steps, as powers of the golden ratio times the body's line height. */
export const SPACE_STEPS = [
  { name: 'xs', power: -2 },
  { name: 's', power: -1 },
  { name: 'm', power: 0 },
  { name: 'l', power: 1 },
  { name: 'xl', power: 2 },
] as const

/** Everything the calculator works out for a body font size and a line width, in pixels. */
export function getTypeSystem(fontSize: number, width: number) {
  const lineHeight = getGoldenLineHeight(fontSize, width)
  const wholeLineHeight = Math.round(lineHeight)
  return {
    lineHeight,
    wholeLineHeight,
    goldenWidth: getGoldenWidth(fontSize),
    goldenSize: getGoldenFontSize(width),
    tunedWidth: getTunedWidth(fontSize, wholeLineHeight),
    levels: TYPE_LEVELS.map((level) => {
      const px = fontSize * PHI ** level.power
      return { ...level, px, lineHeight: getGoldenLineHeight(px, width) }
    }),
    spacing: SPACE_STEPS.map((step) => ({ ...step, px: lineHeight * PHI ** step.power })),
  }
}

/** The type system as custom properties, plus the rules that use them, ready to paste. */
export function buildSystemCss(fontSize: number, width: number): string {
  const { levels, spacing } = getTypeSystem(fontSize, width)
  const headings = levels.filter((level) => level.name.startsWith('h'))
  const property = (name: string, px: number) => `  --${name}: ${toRem(px)}; /* ${formatPx(px)} */`
  const unitless = (name: string, px: number, lineHeight: number) =>
    `  --${name}-line-height: ${round(lineHeight / px)};`
  return [
    ':root {',
    property('content-width', width),
    ...levels.flatMap((level) => [
      property(`text-${level.name}`, level.px),
      unitless(`text-${level.name}`, level.px, level.lineHeight),
    ]),
    ...spacing.map((step) => property(`space-${step.name}`, step.px)),
    '}',
    '',
    'body {',
    '  font-size: var(--text-body);',
    '  line-height: var(--text-body-line-height);',
    '}',
    '',
    '.content {',
    '  max-width: var(--content-width);',
    '}',
    '',
    ...headings.flatMap((level) => [
      `${level.name} {`,
      `  font-size: var(--text-${level.name});`,
      `  line-height: var(--text-${level.name}-line-height);`,
      '  margin-block: var(--space-l) var(--space-s);',
      '}',
      '',
    ]),
    'p,',
    'ul,',
    'ol {',
    '  margin-block: 0 var(--space-m);',
    '}',
    '',
    'small {',
    '  font-size: var(--text-small);',
    '  line-height: var(--text-small-line-height);',
    '}',
  ].join('\n')
}
