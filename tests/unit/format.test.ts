import { describe, expect, it } from 'vitest'
import { escapeHtml, exifSummary, formatDate, formatShortDate, validDate } from '@/lib/format'
import { fullImageUrl, optimizedImageUrl } from '@/lib/images'

describe('formatDate', () => {
  it('prints the date as written, in UTC', () => {
    expect(formatDate('2024-06-01T00:00:00Z')).toBe('June 1, 2024')
    expect(formatDate('2024-01-11T23:59:00')).toBe('January 11, 2024')
  })
})

describe('formatShortDate', () => {
  it('prints a short date, reading zone-less dates as UTC', () => {
    expect(formatShortDate('2024-01-11T23:59:00')).toBe('Jan 11, 2024')
    expect(formatShortDate('2024-06-01T00:00:00Z')).toBe('Jun 1, 2024')
  })
})

describe('validDate', () => {
  it('returns parseable dates and drops the rest', () => {
    expect(validDate('2024-01-11T16:13:21')).toBe('2024-01-11T16:13:21')
    expect(validDate('not a date')).toBeUndefined()
  })
})

describe('exifSummary', () => {
  it('joins the fields that exist', () => {
    expect(
      exifSummary({
        camera: 'Sony',
        lens: '35mm',
        focalLength: '35mm',
        aperture: 'f/2',
        shutterSpeed: '1/60s',
        iso: '100',
      }),
    ).toBe('Sony · 35mm · 35mm · f/2 · 1/60s · ISO 100')
    expect(exifSummary({ camera: 'Sony' })).toBe('Sony')
    expect(exifSummary({})).toBe('')
  })
})

describe('escapeHtml', () => {
  it('escapes markup characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#x27;&amp;&#x27;&lt;/a&gt;',
    )
  })
})

describe('image URLs', () => {
  it('builds optimizer URLs', () => {
    expect(optimizedImageUrl('/content/a b.jpg', 640)).toBe(
      '/_next/image?url=%2Fcontent%2Fa%20b.jpg&w=640&q=75',
    )
  })

  it('keeps HDR originals and picks the largest width that fits', () => {
    expect(fullImageUrl('/a.jpg', 5000, true)).toBe('/a.jpg')
    expect(fullImageUrl('/a.jpg', 5000, false)).toContain('w=3840')
    expect(fullImageUrl('/a.jpg', 2500, false)).toContain('w=2048')
    expect(fullImageUrl('/a.jpg', 800, false)).toContain('w=1920')
  })
})
