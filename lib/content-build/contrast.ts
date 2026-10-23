type Rgb = [number, number, number]

function parseHex(hex: string): Rgb {
  const value = hex.replace('#', '')
  const full = value.length <= 4 ? [...value].map((c) => c + c).join('') : value
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

function luminance([r, g, b]: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio between two hex colors. */
export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(parseHex(a)), luminance(parseHex(b))]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/**
 * Returns `color` unchanged when it meets `min` contrast on `background`,
 * otherwise mixes it toward black (light backgrounds) or white (dark ones)
 * until it does. Keeps a theme's hues while meeting WCAG AA.
 *
 * @param color - Six- or three-digit hex text color.
 * @param background - Hex background color.
 * @param min - Contrast ratio to reach.
 * @returns A hex color, lowercase.
 */
export function readableColor(color: string, background: string, min = 4.5): string {
  if (contrastRatio(color, background) >= min) return color
  const from = parseHex(color)
  const target = luminance(parseHex(background)) > 0.5 ? 0 : 255
  for (let step = 1; step <= 50; step++) {
    const mixed = toHex(from.map((c) => c + (target - c) * (step / 50)) as Rgb)
    if (contrastRatio(mixed, background) >= min) return mixed
  }
  /* v8 ignore next */
  return target === 0 ? '#000000' : '#ffffff'
}
