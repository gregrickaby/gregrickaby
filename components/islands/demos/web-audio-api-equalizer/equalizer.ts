/** The ten octave bands of a graphic equalizer, in Hz. */
export const BANDS = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const

/** The sample rate the response curves are drawn at, a common default. */
export const CURVE_RATE = 48_000

/** How a slider set turns into a filter: its shape, center, boost in dB, and width. */
export interface FilterSpec {
  type: 'lowshelf' | 'peaking' | 'highshelf'
  frequency: number
  gain: number
  q: number
}

/** How wide each band's bump is. About 1.4 makes neighbors overlap a little. */
export const BAND_Q = 1.4

/** Slider settings in dB for each of the ten bands. */
export const PRESETS: Record<string, readonly number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass boost': [9, 8, 6, 3, 0, 0, 0, 0, 0, 0],
  'Smiley face': [6, 4, 2, 0, -3, -3, 0, 2, 4, 6],
  Telephone: [-24, -24, -24, -6, 0, 3, 3, -6, -24, -24],
  Underwater: [3, 3, 2, 0, -6, -12, -18, -24, -24, -24],
  'Turn it all up': [12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
}

/** Cuts every band where the melody's notes sit, and leaves the rest alone. */
export const GHOST_CUT: readonly number[] = [0, 0, 0, 0, -24, -24, -24, 0, 0, 0]

/** Decibels to a gain multiplier: +6 dB about doubles the wave, -6 dB halves it. */
export function dbToGain(db: number): number {
  return 10 ** (db / 20)
}

/** A band's label: `31`, `500`, `1k`, `16k`. */
export function formatBand(hz: number): string {
  return hz >= 1000 ? `${Math.round(hz / 100) / 10}k` : `${Math.round(hz)}`
}

/** A frequency for a caption: `440 Hz`, `1.2 kHz`. */
export function formatHz(hz: number): string {
  return hz >= 1000 ? `${Math.round(hz / 100) / 10} kHz` : `${Math.round(hz)} Hz`
}

/** A boost or cut with its sign: `+6 dB`, `0 dB`, `-12 dB`. */
export function formatDb(db: number): string {
  return `${db > 0 ? '+' : ''}${db} dB`
}

/** A slider's 0 to 100 turned into a frequency, spaced by octaves from 31 Hz to 16 kHz. */
export function positionToHz(position: number): number {
  return 31 * (16_000 / 31) ** (position / 100)
}

/**
 * The ten bands as filters: shelves on the ends, so the lowest and highest
 * sliders lift everything past them, and bumps in between.
 */
export function bandFilters(gains: readonly number[]): FilterSpec[] {
  return BANDS.map((frequency, i) => ({
    type: i === 0 ? 'lowshelf' : i === BANDS.length - 1 ? 'highshelf' : 'peaking',
    frequency,
    gain: gains[i] ?? 0,
    q: BAND_Q,
  }))
}

/**
 * The bins that feed each bar. Evenly, every bar gets the same number of
 * bins. By octaves, each bar runs from half an octave below its band to half
 * an octave above, the way ears hear pitch.
 */
export function binRanges(
  sampleRate: number,
  bins: number,
  spacing: 'even' | 'octaves',
): [start: number, end: number][] {
  if (spacing === 'even') {
    const width = bins / BANDS.length
    return BANDS.map((_, i) => [Math.floor(i * width), Math.floor((i + 1) * width)])
  }
  const binHz = sampleRate / 2 / bins
  return BANDS.map((center) => {
    const start = Math.min(bins - 1, Math.floor(center / Math.SQRT2 / binHz))
    const end = Math.min(bins, Math.max(start + 1, Math.ceil((center * Math.SQRT2) / binHz)))
    return [start, end]
  })
}

/** The loudest bin in each range, from 0 to 1. */
export function bandLevels(
  data: Uint8Array,
  ranges: readonly (readonly [number, number])[],
): number[] {
  return ranges.map(([start, end]) => Math.max(...data.subarray(start, end)) / 255)
}

/**
 * How much one filter lifts or cuts a frequency, in dB. These are the Audio
 * EQ Cookbook formulas that the Web Audio spec uses for `BiquadFilterNode`,
 * so the curve matches what the browser plays. Shelves use a slope of 1 and
 * ignore `q`, like the browser does.
 */
export function filterResponse(spec: FilterSpec, hz: number, sampleRate = CURVE_RATE): number {
  const a = 10 ** (spec.gain / 40)
  const w0 = (2 * Math.PI * spec.frequency) / sampleRate
  const cos = Math.cos(w0)
  let b: [number, number, number]
  let d: [number, number, number]
  if (spec.type === 'peaking') {
    const alpha = Math.sin(w0) / (2 * spec.q)
    b = [1 + alpha * a, -2 * cos, 1 - alpha * a]
    d = [1 + alpha / a, -2 * cos, 1 - alpha / a]
  } else {
    const twoRootAAlpha = Math.sqrt(a) * Math.sin(w0) * Math.SQRT2
    const sign = spec.type === 'lowshelf' ? 1 : -1
    b = [
      a * (a + 1 - sign * (a - 1) * cos + twoRootAAlpha),
      sign * 2 * a * (a - 1 - sign * (a + 1) * cos),
      a * (a + 1 - sign * (a - 1) * cos - twoRootAAlpha),
    ]
    d = [
      a + 1 + sign * (a - 1) * cos + twoRootAAlpha,
      -sign * 2 * (a - 1 + sign * (a + 1) * cos),
      a + 1 + sign * (a - 1) * cos - twoRootAAlpha,
    ]
  }
  const w = (2 * Math.PI * hz) / sampleRate
  return 20 * Math.log10(magnitude(b, w) / magnitude(d, w))
}

function magnitude([c0, c1, c2]: readonly [number, number, number], w: number): number {
  const real = c0 + c1 * Math.cos(w) + c2 * Math.cos(2 * w)
  const imag = c1 * Math.sin(w) + c2 * Math.sin(2 * w)
  return Math.hypot(real, imag)
}

/**
 * The whole chain's curve from 20 Hz to 20 kHz, spaced by octaves, scaled so
 * ±`range` dB fills a plot. Filters in a row add their dB.
 */
export function responseCurve(specs: readonly FilterSpec[], points = 120, range = 24): number[] {
  return Array.from({ length: points }, (_, i) => {
    const hz = 20 * 1000 ** (i / (points - 1))
    const db = specs.reduce((sum, spec) => sum + filterResponse(spec, hz), 0)
    return Math.max(-1, Math.min(1, db / range))
  })
}
