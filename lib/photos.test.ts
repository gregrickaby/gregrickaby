vi.mock('react', () => ({cache: (fn: unknown) => fn}))

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn()
  }
}))

vi.mock('exifr', () => ({
  default: {
    parse: vi.fn()
  }
}))

vi.mock('image-size', () => ({
  default: vi.fn()
}))

import exifr from 'exifr'
import sizeOf from 'image-size'
import fs from 'node:fs'
import {getPhotos} from './photos'

const mockExistsSync = vi.mocked(fs.existsSync)
const mockReaddirSync = vi.mocked(fs.readdirSync)
const mockReadFileSync = vi.mocked(fs.readFileSync)
const mockParse = vi.mocked(exifr.parse)
const mockSizeOf = vi.mocked(sizeOf)

afterEach(() => {
  vi.resetAllMocks()
})

describe('getPhotos', () => {
  it('returns an empty array when the photos directory does not exist', async () => {
    mockExistsSync.mockReturnValue(false)
    const photos = await getPhotos()
    expect(photos).toEqual([])
  })

  it('returns an empty array when the directory has no image files', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([
      'readme.txt',
      '.DS_Store'
    ] as unknown as ReturnType<typeof fs.readdirSync>)
    const photos = await getPhotos()
    expect(photos).toEqual([])
  })

  it('reads EXIF data and returns photo metadata', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue(['sunset.jpg'] as unknown as ReturnType<
      typeof fs.readdirSync
    >)
    mockReadFileSync.mockReturnValue(
      Buffer.from('fake') as ReturnType<typeof fs.readFileSync>
    )
    mockSizeOf.mockReturnValue({width: 4000, height: 3000, type: 'jpg'})
    mockParse.mockResolvedValue({
      Make: 'Canon',
      Model: 'Canon EOS R5',
      LensModel: 'RF 70-200mm F2.8L IS USM',
      FNumber: 2.8,
      ExposureTime: 0.004,
      ISO: 400,
      FocalLength: 200,
      DateTimeOriginal: new Date('2024-06-15T10:30:00Z'),
      ObjectName: 'Sunset at the Pier',
      'Caption-Abstract': 'A beautiful sunset.',
      latitude: 30.6954,
      longitude: -87.9022
    })

    const photos = await getPhotos()
    expect(photos).toHaveLength(1)

    const photo = photos[0]
    expect(photo.filename).toBe('sunset.jpg')
    expect(photo.title).toBe('Sunset at the Pier')
    expect(photo.caption).toBe('A beautiful sunset.')
    expect(photo.width).toBe(4000)
    expect(photo.height).toBe(3000)
    expect(photo.camera).toBe('Canon EOS R5')
    expect(photo.lens).toBe('RF 70-200mm F2.8L IS USM')
    expect(photo.aperture).toBe('f/2.8')
    expect(photo.shutterSpeed).toBe('1/250s')
    expect(photo.iso).toBe('400')
    expect(photo.focalLength).toBe('200mm')
    expect(photo.dateTaken).toBe('2024-06-15T10:30:00.000Z')
    expect(photo.gps).toEqual({latitude: 30.6954, longitude: -87.9022})
  })

  it('falls back to filename-based title when IPTC title is missing', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([
      'morning-mist.jpg'
    ] as unknown as ReturnType<typeof fs.readdirSync>)
    mockReadFileSync.mockReturnValue(
      Buffer.from('fake') as ReturnType<typeof fs.readFileSync>
    )
    mockSizeOf.mockReturnValue({width: 1920, height: 1080, type: 'jpg'})
    mockParse.mockResolvedValue(null)

    const photos = await getPhotos()
    expect(photos[0].title).toBe('Morning Mist')
  })

  it('sorts photos newest first by dateTaken', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([
      'old.jpg',
      'new.jpg'
    ] as unknown as ReturnType<typeof fs.readdirSync>)
    mockReadFileSync.mockReturnValue(
      Buffer.from('fake') as ReturnType<typeof fs.readFileSync>
    )
    mockSizeOf.mockReturnValue({width: 800, height: 600, type: 'jpg'})

    mockParse
      .mockResolvedValueOnce({
        DateTimeOriginal: new Date('2023-01-01T00:00:00Z')
      })
      .mockResolvedValueOnce({
        DateTimeOriginal: new Date('2024-06-01T00:00:00Z')
      })

    const photos = await getPhotos()
    expect(photos[0].filename).toBe('new.jpg')
    expect(photos[1].filename).toBe('old.jpg')
  })

  it('places photos with dateTaken before photos without', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([
      'no-date.jpg',
      'has-date.jpg'
    ] as unknown as ReturnType<typeof fs.readdirSync>)
    mockReadFileSync.mockReturnValue(
      Buffer.from('fake') as ReturnType<typeof fs.readFileSync>
    )
    mockSizeOf.mockReturnValue({width: 800, height: 600, type: 'jpg'})

    mockParse.mockResolvedValueOnce(null).mockResolvedValueOnce({
      DateTimeOriginal: new Date('2024-06-01T00:00:00Z')
    })

    const photos = await getPhotos()
    expect(photos[0].filename).toBe('has-date.jpg')
    expect(photos[1].filename).toBe('no-date.jpg')
  })

  it('sorts by filename descending when neither photo has dateTaken', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([
      'alpha.jpg',
      'zebra.jpg'
    ] as unknown as ReturnType<typeof fs.readdirSync>)
    mockReadFileSync.mockReturnValue(
      Buffer.from('fake') as ReturnType<typeof fs.readFileSync>
    )
    mockSizeOf.mockReturnValue({width: 800, height: 600, type: 'jpg'})
    mockParse.mockResolvedValue(null)

    const photos = await getPhotos()
    expect(photos[0].filename).toBe('zebra.jpg')
    expect(photos[1].filename).toBe('alpha.jpg')
  })

  it('handles EXIF parse failures gracefully', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue(['broken.jpg'] as unknown as ReturnType<
      typeof fs.readdirSync
    >)
    mockReadFileSync.mockReturnValue(
      Buffer.from('fake') as ReturnType<typeof fs.readFileSync>
    )
    mockSizeOf.mockReturnValue({width: 640, height: 480, type: 'jpg'})
    mockParse.mockRejectedValue(new Error('Bad EXIF'))

    const photos = await getPhotos()
    expect(photos).toHaveLength(1)
    expect(photos[0].title).toBe('Broken')
    expect(photos[0].camera).toBeUndefined()
  })

  it('returns original title when high bytes are not valid UTF-8', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue(['bad.jpg'] as unknown as ReturnType<
      typeof fs.readdirSync
    >)
    mockReadFileSync.mockReturnValue(
      Buffer.from('fake') as ReturnType<typeof fs.readFileSync>
    )
    mockSizeOf.mockReturnValue({width: 800, height: 600, type: 'jpg'})
    // 0xFE and 0xFD are not valid UTF-8 bytes; fixMojibake should fall back
    // and return the original string unchanged.
    const invalidTitle = '\xfe\xfd'
    mockParse.mockResolvedValue({ObjectName: invalidTitle})

    const photos = await getPhotos()
    expect(photos[0].title).toBe(invalidTitle)
  })

  it('fixes mojibake in IPTC title and caption', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue(['mist.jpg'] as unknown as ReturnType<
      typeof fs.readdirSync
    >)
    mockReadFileSync.mockReturnValue(
      Buffer.from('fake') as ReturnType<typeof fs.readFileSync>
    )
    mockSizeOf.mockReturnValue({width: 800, height: 600, type: 'jpg'})
    // UTF-8 encoded en dash (U+2013, bytes E2 80 93) wrongly read as Latin-1
    // produces the three characters \u00e2\u0080\u0093.
    // UTF-8 encoded right single quote (U+2019, bytes E2 80 99) produces \u00e2\u0080\u0099.
    mockParse.mockResolvedValue({
      ObjectName: 'Morning Mist \u00e2\u0080\u0093 Lake',
      'Caption-Abstract': 'Dave\u00e2\u0080\u0099s Falls'
    })

    const photos = await getPhotos()
    expect(photos[0].title).toBe('Morning Mist \u2013 Lake')
    expect(photos[0].caption).toBe('Dave\u2019s Falls')
  })

  it('handles camera model that already includes make name', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue(['test.jpg'] as unknown as ReturnType<
      typeof fs.readdirSync
    >)
    mockReadFileSync.mockReturnValue(
      Buffer.from('fake') as ReturnType<typeof fs.readFileSync>
    )
    mockSizeOf.mockReturnValue({width: 800, height: 600, type: 'jpg'})
    mockParse.mockResolvedValue({
      Make: 'SONY',
      Model: 'SONY ILCE-7M4'
    })

    const photos = await getPhotos()
    expect(photos[0].camera).toBe('SONY ILCE-7M4')
  })

  it('formats shutter speed >= 1 second correctly', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([
      'long-exposure.jpg'
    ] as unknown as ReturnType<typeof fs.readdirSync>)
    mockReadFileSync.mockReturnValue(
      Buffer.from('fake') as ReturnType<typeof fs.readFileSync>
    )
    mockSizeOf.mockReturnValue({width: 800, height: 600, type: 'jpg'})
    mockParse.mockResolvedValue({ExposureTime: 30})

    const photos = await getPhotos()
    expect(photos[0].shutterSpeed).toBe('30s')
  })
})
