import { beforeEach, describe, expect, it, vi } from 'vitest'
import { photo } from '@/tests/helpers/content'

const parse = vi.fn()
vi.mock('exifr', () => ({ default: { parse } }))
vi.mock('image-size', () => ({ imageSize: () => ({ width: 3000, height: 2000 }) }))

const { comparePhotos, fixMojibake, hasGainMap, readPhoto, titleFromFilename } =
  await import('@/lib/content-build/photos')

beforeEach(() => parse.mockReset())

describe('photo helpers', () => {
  it('detects HDR gain maps', () => {
    expect(hasGainMap(Buffer.from('xmp hdrgm:Version'))).toBe(true)
    expect(hasGainMap(Buffer.from('plain jpeg'))).toBe(false)
  })

  it('re-decodes UTF-8 read as Latin-1, and keeps text that is not', () => {
    const mojibake = String.fromCodePoint(...new TextEncoder().encode('Bella – Leap'))
    expect(fixMojibake(mojibake)).toBe('Bella – Leap')
    expect(fixMojibake('Plain')).toBe('Plain')
    expect(fixMojibake('café')).toBe('café')
  })

  it('titles a photo from its filename', () => {
    expect(titleFromFilename('sunset-at-the_pier.jpg')).toBe('Sunset At The Pier')
  })

  it('sorts newest first, undated last by filename descending', () => {
    const a = photo({ filename: 'a.jpg', dateTaken: '2024-01-01T00:00:00Z' })
    const b = photo({ filename: 'b.jpg', dateTaken: '2025-01-01T00:00:00Z' })
    const c = photo({ filename: 'c.jpg' })
    const d = photo({ filename: 'd.jpg' })
    expect([a, c, b, d].sort(comparePhotos).map((p) => p.filename)).toEqual([
      'b.jpg',
      'a.jpg',
      'd.jpg',
      'c.jpg',
    ])
  })
})

describe('readPhoto', () => {
  it('reads size, EXIF, and IPTC fields', async () => {
    parse.mockResolvedValue({
      Make: 'SONY',
      Model: 'ILCE-7RM5',
      LensModel: 'E 35-150mm',
      FNumber: 2.8,
      ExposureTime: 1 / 60,
      ISO: 100,
      FocalLength: 89.4,
      ObjectName: 'You Will Float',
      'Caption-Abstract': 'Halloween',
      DateTimeOriginal: new Date('2025-10-31T22:51:08Z'),
    })
    expect(await readPhoto(Buffer.from('hdrgm'), 'float.jpg')).toEqual({
      filename: 'float.jpg',
      src: '/content/photos/float.jpg',
      width: 3000,
      height: 2000,
      hdr: true,
      title: 'You Will Float',
      caption: 'Halloween',
      camera: 'SONY ILCE-7RM5',
      lens: 'E 35-150mm',
      aperture: 'f/2.8',
      shutterSpeed: '1/60s',
      iso: '100',
      focalLength: '89mm',
      dateTaken: '2025-10-31T22:51:08.000Z',
    })
  })

  it('does not repeat the make when the model starts with it', async () => {
    parse.mockResolvedValue({ Make: 'Canon', Model: 'Canon EOS R5', FNumber: 4, ExposureTime: 2 })
    const result = await readPhoto(Buffer.from(''), 'x.jpg')
    expect(result.camera).toBe('Canon EOS R5')
    expect(result.aperture).toBe('f/4')
    expect(result.shutterSpeed).toBe('2s')
  })

  it('uses the model alone when the make is missing', async () => {
    parse.mockResolvedValue({ Model: 'GX85' })
    expect((await readPhoto(Buffer.from(''), 'x.jpg')).camera).toBe('GX85')
  })

  it('falls back to the filename when there is no EXIF', async () => {
    parse.mockResolvedValue(undefined)
    const result = await readPhoto(Buffer.from(''), 'morning_mist.jpg')
    expect(result).toMatchObject({ title: 'Morning Mist', hdr: false })
    expect(result.camera).toBeUndefined()
    expect(result.dateTaken).toBeUndefined()
  })
})
