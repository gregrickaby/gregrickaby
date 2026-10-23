import exifr from 'exifr'
import { imageSize } from 'image-size'

import type { Photo } from '../types.ts'

type Exif = Record<string, unknown>

const LATIN1_RANGE = /[\x80-\xff]/
const EXTENSION = /\.\w+$/
const SEPARATOR = /[-_]/g
const WORD_START = /\b\w/g

/** True when a JPEG carries an Ultra HDR / Adobe gain map (`hdrgm` XMP namespace). */
export function hasGainMap(buffer: Buffer): boolean {
  return buffer.includes('hdrgm')
}

function formatAperture(fNumber: number): string {
  return `f/${Number.isInteger(fNumber) ? fNumber : fNumber.toFixed(1)}`
}

function formatShutterSpeed(seconds: number): string {
  return seconds >= 1 ? `${seconds}s` : `1/${Math.round(1 / seconds)}s`
}

/**
 * IPTC strings from some cameras are UTF-8 that exifr decodes as Latin-1,
 * turning "–" into "â€". Re-decode them, and keep the original if that fails.
 */
export function fixMojibake(value: string): string {
  if (!LATIN1_RANGE.test(value)) return value
  try {
    const bytes = new Uint8Array([...value].map((c) => c.charCodeAt(0)))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return value
  }
}

/** "sunset-at-the_pier.jpg" becomes "Sunset At The Pier". */
export function titleFromFilename(filename: string): string {
  return filename
    .replace(EXTENSION, '')
    .replaceAll(SEPARATOR, ' ')
    .replaceAll(WORD_START, (c) => c.toUpperCase())
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value ? fixMojibake(value.trim()) : undefined
}

function camera(exif: Exif | null): string | undefined {
  const model = typeof exif?.Model === 'string' ? exif.Model.trim() : ''
  if (!model) return undefined
  const make = typeof exif?.Make === 'string' ? exif.Make.trim() : ''
  return model.toLowerCase().startsWith(make.toLowerCase()) ? model : `${make} ${model}`
}

/**
 * Reads a photo's size, EXIF, and IPTC fields. A photo without EXIF still gets
 * a title from its filename.
 *
 * @param buffer - The image file.
 * @param filename - The file's name, used for the URL and as a title fallback.
 * @returns The gallery entry.
 */
export async function readPhoto(buffer: Buffer, filename: string): Promise<Photo> {
  const { width = 0, height = 0 } = imageSize(buffer)

  let exif: Exif | null = null
  try {
    exif = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      iptc: true,
      xmp: true,
      mergeOutput: true,
      translateKeys: true,
      translateValues: true,
      reviveValues: true,
    })
  } catch {
    // Files without EXIF fall back to the filename.
  }

  const num = (key: string) => (typeof exif?.[key] === 'number' ? (exif[key] as number) : undefined)
  const fNumber = num('FNumber')
  const exposure = num('ExposureTime')
  const iso = num('ISO')
  const focal = num('FocalLength')
  const taken = exif?.DateTimeOriginal

  return {
    filename,
    src: `/content/photos/${filename}`,
    width,
    height,
    hdr: hasGainMap(buffer),
    title:
      text(exif?.ObjectName ?? exif?.title ?? exif?.Title ?? exif?.Headline) ??
      titleFromFilename(filename),
    caption: text(exif?.Caption ?? exif?.['Caption-Abstract'] ?? exif?.ImageDescription),
    camera: camera(exif),
    lens: text(exif?.LensModel),
    aperture: fNumber === undefined ? undefined : formatAperture(fNumber),
    shutterSpeed: exposure === undefined ? undefined : formatShutterSpeed(exposure),
    iso: iso === undefined ? undefined : String(iso),
    focalLength: focal === undefined ? undefined : `${Math.round(focal)}mm`,
    dateTaken: taken instanceof Date ? taken.toISOString() : undefined,
  }
}

/** Newest first by capture date; undated photos last, by filename descending. */
export function comparePhotos(a: Photo, b: Photo): number {
  if (a.dateTaken && b.dateTaken) return b.dateTaken.localeCompare(a.dateTaken)
  if (a.dateTaken) return -1
  if (b.dateTaken) return 1
  return b.filename.localeCompare(a.filename)
}
