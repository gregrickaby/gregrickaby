import { getBuildTime, getPhotos } from '@/lib/content'
import { SITE } from '@/lib/site'

/**
 * JSON list of every photo, with absolute image URLs. Prerendered at build time.
 *
 * For clients that want the gallery as data, such as a TV that pulls these as
 * rotating wallpapers. Each `url` is the full-size original under
 * `public/content/`, so a client can download and resize it however it likes.
 */
export function GET() {
  const photos = getPhotos().map((photo) => ({
    filename: photo.filename,
    title: photo.title,
    // encodeURI keeps the slashes but percent-encodes spaces and other unsafe characters, so a
    // filename like "Modern Cleaners.jpg" yields a URL a plain HTTP client can fetch.
    url: `${SITE.url}${encodeURI(photo.src)}`,
    width: photo.width,
    height: photo.height,
    hdr: photo.hdr,
    dateTaken: photo.dateTaken,
  }))

  return Response.json(
    { generatedAt: new Date(getBuildTime()).toISOString(), count: photos.length, photos },
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  )
}
