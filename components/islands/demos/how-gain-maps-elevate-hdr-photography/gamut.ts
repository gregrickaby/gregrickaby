/** A point on the CIE 1931 chromaticity chart. */
export type Point = readonly [x: number, y: number]

/**
 * The edge of human color vision on the CIE 1931 chart: pure light from 420 to 700 nm, every
 * 5 nm to 650. The straight line from the last point back to the first is the purples, which
 * no single wavelength makes.
 */
export const LOCUS: readonly Point[] = [
  [0.1714, 0.0051],
  [0.1703, 0.0058],
  [0.1689, 0.0069],
  [0.1669, 0.0086],
  [0.1644, 0.0109],
  [0.1611, 0.0138],
  [0.1566, 0.0177],
  [0.151, 0.0227],
  [0.144, 0.0297],
  [0.1355, 0.0399],
  [0.1241, 0.0578],
  [0.1096, 0.0868],
  [0.0913, 0.1327],
  [0.0687, 0.2007],
  [0.0454, 0.295],
  [0.0235, 0.4127],
  [0.0082, 0.5384],
  [0.0039, 0.6548],
  [0.0139, 0.7502],
  [0.0389, 0.812],
  [0.0743, 0.8338],
  [0.1142, 0.8262],
  [0.1547, 0.8059],
  [0.1929, 0.7816],
  [0.2296, 0.7543],
  [0.2658, 0.7243],
  [0.3016, 0.6923],
  [0.3373, 0.6589],
  [0.3731, 0.6245],
  [0.4087, 0.5896],
  [0.4441, 0.5547],
  [0.4788, 0.5202],
  [0.5125, 0.4866],
  [0.5448, 0.4544],
  [0.5752, 0.4242],
  [0.6029, 0.3965],
  [0.627, 0.3725],
  [0.6482, 0.3514],
  [0.6658, 0.334],
  [0.6801, 0.3197],
  [0.6915, 0.3083],
  [0.7006, 0.2993],
  [0.7079, 0.292],
  [0.714, 0.2859],
  [0.719, 0.2809],
  [0.723, 0.277],
  [0.726, 0.274],
  [0.7347, 0.2653],
]

export type Space = 'srgb' | 'p3' | 'rec2020'

/** Each color space's red, green, and blue primaries, from its spec. */
export const SPACES: Record<Space, { name: string; primaries: readonly Point[] }> = {
  srgb: {
    name: 'sRGB',
    primaries: [
      [0.64, 0.33],
      [0.3, 0.6],
      [0.15, 0.06],
    ],
  },
  p3: {
    name: 'Display P3',
    primaries: [
      [0.68, 0.32],
      [0.265, 0.69],
      [0.15, 0.06],
    ],
  },
  rec2020: {
    name: 'Rec. 2020',
    primaries: [
      [0.708, 0.292],
      [0.17, 0.797],
      [0.131, 0.046],
    ],
  },
}

/** The chart's range: the locus fits inside 0.8 across and 0.9 up. */
export const CHART_WIDTH = 0.8
export const CHART_HEIGHT = 0.9

/** A polygon's area, by the shoelace formula. */
export function area(points: readonly Point[]): number {
  let sum = 0
  for (const [i, [x1, y1]] of points.entries()) {
    const [x2, y2] = points[(i + 1) % points.length]!
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum) / 2
}

/** How much of the chart's visible colors a space covers, as a whole percentage. */
export function coverage(space: Space): number {
  return Math.round((area(SPACES[space].primaries) / area(LOCUS)) * 100)
}

/** Whether a point sits inside a polygon, by counting edge crossings. */
export function inside([x, y]: Point, points: readonly Point[]): boolean {
  let hit = false
  for (const [i, [x1, y1]] of points.entries()) {
    const [x2, y2] = points[(i + 1) % points.length]!
    if (y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) hit = !hit
  }
  return hit
}

/** Converts CIE XYZ to linear RGB in a screen's color space. */
type Matrix = readonly [number, number, number, number, number, number, number, number, number]

export const SRGB_MATRIX: Matrix = [
  3.2404542, -1.5371385, -0.4985314, -0.969266, 1.8760108, 0.041556, 0.0556434, -0.2040259,
  1.0572252,
]

export const P3_MATRIX: Matrix = [
  2.4934969, -0.9313836, -0.4027108, -0.829489, 1.7626641, 0.0236247, 0.0358458, -0.0761724,
  0.9568845,
]

/** The sRGB transfer curve, which Display P3 shares. */
function encode(linear: number): number {
  return linear <= 0.0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - 0.055
}

/**
 * The color a screen draws for a point on the chart, as 0 to 255 per channel. Colors outside the
 * screen's space clip to its edge, and each is scaled up until its brightest channel is full, the
 * way chromaticity charts are usually drawn.
 */
export function chartColor([x, y]: Point, m: Matrix): [number, number, number] {
  const X = x / y
  const Z = (1 - x - y) / y
  const rgb = [m[0] * X + m[1] + m[2] * Z, m[3] * X + m[4] + m[5] * Z, m[6] * X + m[7] + m[8] * Z]
  const clipped = rgb.map((channel) => Math.max(channel, 0))
  const peak = Math.max(...clipped)
  const [r, g, b] = clipped.map((channel) => Math.round(encode(channel / peak) * 255))
  return [r!, g!, b!]
}

/**
 * Paints the colors inside the locus onto a canvas. It asks for a Display P3 canvas, so a
 * wide-gamut screen shows the greens and reds sRGB can't.
 */
export function paintChart(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { colorSpace: 'display-p3' })
  if (!context) return
  const matrix =
    context.getContextAttributes().colorSpace === 'display-p3' ? P3_MATRIX : SRGB_MATRIX
  const { width, height } = canvas
  const image = context.createImageData(width, height)
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const point: Point = [
        ((column + 0.5) / width) * CHART_WIDTH,
        (1 - (row + 0.5) / height) * CHART_HEIGHT,
      ]
      if (!inside(point, LOCUS)) continue
      const at = (row * width + column) * 4
      image.data.set([...chartColor(point, matrix), 255], at)
    }
  }
  context.putImageData(image, 0, 0)
}
