import { describe, expect, it } from 'vitest'

import {
  BANDS,
  bandFilters,
  bandLevels,
  binRanges,
  dbToGain,
  filterResponse,
  formatBand,
  formatDb,
  formatHz,
  positionToHz,
  PRESETS,
  responseCurve,
} from '@/components/islands/demos/web-audio-api-equalizer/equalizer'

describe('formatting', () => {
  it('labels bands, frequencies, and boosts', () => {
    expect(BANDS.map(formatBand)).toEqual([
      '31',
      '62',
      '125',
      '250',
      '500',
      '1k',
      '2k',
      '4k',
      '8k',
      '16k',
    ])
    expect(formatBand(2400)).toBe('2.4k')
    expect(formatHz(440)).toBe('440 Hz')
    expect(formatHz(1234)).toBe('1.2 kHz')
    expect(formatDb(6)).toBe('+6 dB')
    expect(formatDb(0)).toBe('0 dB')
    expect(formatDb(-12)).toBe('-12 dB')
  })
})

describe('dbToGain', () => {
  it('about doubles the wave every 6 dB', () => {
    expect(dbToGain(0)).toBe(1)
    expect(dbToGain(6)).toBeCloseTo(2, 1)
    expect(dbToGain(-6)).toBeCloseTo(0.5, 1)
  })
})

describe('positionToHz', () => {
  it('spreads a slider from 31 Hz to 16 kHz by octaves', () => {
    expect(positionToHz(0)).toBe(31)
    expect(positionToHz(100)).toBeCloseTo(16_000)
    expect(positionToHz(50)).toBeCloseTo(Math.sqrt(31 * 16_000))
  })
})

describe('bandFilters', () => {
  it('puts shelves on the ends and bumps in between', () => {
    const filters = bandFilters([3])
    expect(filters.map((f) => f.type)).toEqual([
      'lowshelf',
      ...Array.from({ length: 8 }, () => 'peaking'),
      'highshelf',
    ])
    expect(filters[0]?.gain).toBe(3)
    expect(filters[1]?.gain).toBe(0)
  })

  it('has ten settings in every preset', () => {
    for (const gains of Object.values(PRESETS)) expect(gains).toHaveLength(10)
  })
})

describe('binRanges', () => {
  it('gives every bar the same number of bins when spaced evenly', () => {
    const ranges = binRanges(48_000, 1000, 'even')
    expect(ranges[0]).toEqual([0, 100])
    expect(ranges[9]).toEqual([900, 1000])
  })

  it('doubles each bar by octaves, with at least one bin each', () => {
    const ranges = binRanges(48_000, 1024, 'octaves')
    expect(ranges[0]).toEqual([0, 2])
    expect(ranges[5]).toEqual([30, 61])
    expect(ranges[9]).toEqual([482, 966])
  })

  it('stays inside the bins at a low sample rate', () => {
    const ranges = binRanges(8, 1024, 'octaves')
    expect(ranges.every(([start, end]) => start === 1023 && end === 1024)).toBe(true)
  })
})

describe('bandLevels', () => {
  it('takes the loudest bin in each range', () => {
    const data = new Uint8Array([0, 51, 255, 102])
    expect(
      bandLevels(data, [
        [0, 2],
        [2, 4],
      ]),
    ).toEqual([0.2, 1])
  })
})

describe('filterResponse', () => {
  it('reaches the gain at the center of a peaking filter and fades away from it', () => {
    const spec = { type: 'peaking', frequency: 1000, gain: 12, q: 1.4 } as const
    expect(filterResponse(spec, 1000)).toBeCloseTo(12, 5)
    expect(filterResponse(spec, 50)).toBeCloseTo(0, 1)
    expect(filterResponse({ ...spec, gain: -12 }, 1000)).toBeCloseTo(-12, 5)
  })

  it('lifts everything below a low shelf and everything above a high shelf', () => {
    const low = { type: 'lowshelf', frequency: 100, gain: 6, q: 1 } as const
    expect(filterResponse(low, 10)).toBeCloseTo(6, 1)
    expect(filterResponse(low, 10_000)).toBeCloseTo(0, 1)
    const high = { type: 'highshelf', frequency: 8000, gain: -6, q: 1 } as const
    expect(filterResponse(high, 20_000)).toBeCloseTo(-6, 0)
    expect(filterResponse(high, 100)).toBeCloseTo(0, 1)
  })
})

describe('responseCurve', () => {
  it('is flat with no filters and clamps big boosts to the plot', () => {
    expect(responseCurve([], 3)).toEqual([0, 0, 0])
    const curve = responseCurve(bandFilters(PRESETS['Turn it all up'] as number[]), 5)
    expect(curve.every((value) => value === 1)).toBe(false)
    expect(Math.max(...curve)).toBeLessThanOrEqual(1)
    expect(Math.min(...responseCurve(bandFilters(Array(10).fill(-24)), 5))).toBe(-1)
  })
})
