import exifr from 'exifr'
import sizeOf from 'image-size'
import fs from 'node:fs'
import path from 'node:path'
import {cache} from 'react'
import type {PhotoMeta} from './types'

/**
 * Directory containing photo files served from the public folder.
 */
const photosDir = path.join(process.cwd(), 'public', 'content', 'photos')

/**
 * Formats an aperture FNumber value into a human-readable f-stop string.
 *
 * @param fNumber - The numeric f-stop value from EXIF data.
 * @returns A formatted string like "f/2.8".
 */
function formatAperture(fNumber: number): string {
  return `f/${Number.isInteger(fNumber) ? fNumber : fNumber.toFixed(1)}`
}

/**
 * Formats an ExposureTime value into a human-readable shutter speed string.
 *
 * @param exposure - The exposure time in seconds from EXIF data.
 * @returns A formatted string like "1/250s" or "2s".
 */
function formatShutterSpeed(exposure: number): string {
  if (exposure >= 1) return `${exposure}s`
  return `1/${Math.round(1 / exposure)}s`
}

/**
 * Fixes UTF-8 text that was wrongly decoded as Latin-1 (mojibake).
 * IPTC strings from some cameras are stored as UTF-8 but exifr may decode
 * them byte-by-byte as Latin-1, turning "–" into "â€" etc.
 * Uses `{fatal: true}` so invalid byte sequences fall back to the original.
 *
 * @param str - A string that may contain mojibake characters.
 * @returns The correctly decoded string, or the original if re-decoding fails.
 */
function fixMojibake(str: string): string {
  if (!/[\x80-\xff]/.test(str)) return str
  try {
    const bytes = new Uint8Array([...str].map((c) => c.charCodeAt(0)))
    return new TextDecoder('utf-8', {fatal: true}).decode(bytes)
  } catch {
    return str
  }
}

/**
 * Converts a filename like "sunset-at-the-pier.jpg" into a title-cased string.
 *
 * @param filename - The image filename.
 * @returns A human-readable title derived from the filename.
 */
function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.\w+$/, '')
    .replaceAll(/[-_]/g, ' ')
    .replaceAll(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Reads EXIF/IPTC metadata and image dimensions for a single photo file.
 *
 * @param filePath - Absolute path to the image file.
 * @param filename - The image filename.
 * @returns A PhotoMeta object with all available metadata.
 */
async function readPhotoMeta(
  filePath: string,
  filename: string
): Promise<PhotoMeta> {
  const buffer = fs.readFileSync(filePath)

  // Read dimensions (always available from JPEG SOF marker).
  const dimensions = sizeOf(buffer)
  const width = dimensions.width ?? 0
  const height = dimensions.height ?? 0

  // Read EXIF + IPTC + GPS data.
  let exif: Record<string, unknown> | null = null
  try {
    exif = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      gps: true,
      iptc: true,
      xmp: true,
      mergeOutput: true,
      translateKeys: true,
      translateValues: true,
      reviveValues: true
    })
  } catch {
    // Some images may not have EXIF data.
  }

  // Build camera string from Make + Model.
  let camera: string | undefined
  if (exif?.Model) {
    const make = String(exif.Make ?? '').trim()
    const model = String(exif.Model).trim()
    // Many camera models already include the make name.
    camera = model.toLowerCase().startsWith(make.toLowerCase())
      ? model
      : `${make} ${model}`
  }

  // IPTC title (ObjectName) or XMP title.
  const iptcTitle =
    exif?.ObjectName ?? exif?.title ?? exif?.Title ?? exif?.Headline
  const title = iptcTitle
    ? fixMojibake(String(iptcTitle))
    : titleFromFilename(filename)

  // IPTC caption.
  const rawCaption =
    exif?.Caption ?? exif?.['Caption-Abstract'] ?? exif?.ImageDescription
  const caption = rawCaption ? fixMojibake(String(rawCaption)) : undefined

  // GPS coordinates.
  let gps: PhotoMeta['gps']
  if (
    typeof exif?.latitude === 'number' &&
    typeof exif?.longitude === 'number'
  ) {
    gps = {
      latitude: exif.latitude as number,
      longitude: exif.longitude as number
    }
  }

  return {
    filename,
    title,
    caption,
    width,
    height,
    camera,
    lens: exif?.LensModel ? String(exif.LensModel) : undefined,
    aperture:
      typeof exif?.FNumber === 'number'
        ? formatAperture(exif.FNumber as number)
        : undefined,
    shutterSpeed:
      typeof exif?.ExposureTime === 'number'
        ? formatShutterSpeed(exif.ExposureTime as number)
        : undefined,
    iso: exif?.ISO ? String(exif.ISO) : undefined,
    focalLength:
      typeof exif?.FocalLength === 'number'
        ? `${Math.round(exif.FocalLength as number)}mm`
        : undefined,
    dateTaken:
      exif?.DateTimeOriginal instanceof Date
        ? (exif.DateTimeOriginal as Date).toISOString()
        : undefined,
    gps
  }
}

/**
 * Reads all photos from public/content/photos/, extracts EXIF metadata and
 * image dimensions, and returns them sorted newest to oldest by date taken.
 * Falls back to filename sort descending when date is unavailable.
 *
 * Wrapped in React cache() so the work is done once per request.
 *
 * @returns An array of PhotoMeta objects sorted newest first.
 */
export const getPhotos = cache(async (): Promise<PhotoMeta[]> => {
  if (!fs.existsSync(photosDir)) return []

  const files = fs
    .readdirSync(photosDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))

  const photos = await Promise.all(
    files.map((filename) => {
      const filePath = path.join(photosDir, filename)
      return readPhotoMeta(filePath, filename)
    })
  )

  return photos.sort((a, b) => {
    if (a.dateTaken && b.dateTaken) {
      return new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
    }
    if (a.dateTaken) return -1
    if (b.dateTaken) return 1
    return b.filename.localeCompare(a.filename)
  })
})
