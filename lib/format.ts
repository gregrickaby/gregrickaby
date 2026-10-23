const NO_ZONE = /T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/

/**
 * Formats an ISO date as "Jan 11, 2024", for metadata lines. Frontmatter dates
 * have no zone, and `Date` would read them in the machine's zone, so a
 * late-evening post could print as the next day. This reads them as UTC to
 * print the date as written.
 *
 * @param iso - An ISO 8601 date.
 * @returns The formatted date.
 */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(NO_ZONE.test(iso) ? `${iso}Z` : iso))
}

/**
 * The string itself when it parses as a date.
 *
 * @param value - A date string.
 * @returns The string, or undefined when it doesn't parse.
 */
export function validDate(value: string): string | undefined {
  return Number.isNaN(Date.parse(value)) ? undefined : value
}

/** The EXIF summary shown under a photo, such as "SONY ILCE-7RM5 · 89mm · f/2.8". */
export function exifSummary(photo: {
  camera?: string
  lens?: string
  focalLength?: string
  aperture?: string
  shutterSpeed?: string
  iso?: string
}): string {
  return [
    photo.camera,
    photo.lens,
    photo.focalLength,
    photo.aperture,
    photo.shutterSpeed,
    photo.iso ? `ISO ${photo.iso}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ')
}
