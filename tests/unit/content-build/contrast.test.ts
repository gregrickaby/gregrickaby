import { describe, expect, it } from 'vitest'
import { contrastRatio, readableColor } from '@/lib/content-build/contrast'

describe('contrastRatio', () => {
  it('measures the WCAG ratio either way round', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21)
    expect(contrastRatio('#777777', '#777777')).toBe(1)
  })
})

describe('readableColor', () => {
  it('keeps a color that already passes', () => {
    expect(readableColor('#286983', '#f2eee7')).toBe('#286983')
  })

  it('darkens a faint color on a light background', () => {
    const fixed = readableColor('#9893a5', '#f2eee7')
    expect(contrastRatio(fixed, '#f2eee7')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(fixed, '#000')).toBeLessThan(contrastRatio('#9893a5', '#000'))
  })

  it('lightens a faint color on a dark background', () => {
    const fixed = readableColor('#6e6a86', '#161412')
    expect(contrastRatio(fixed, '#161412')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(fixed, '#fff')).toBeLessThan(contrastRatio('#6e6a86', '#fff'))
  })
})
