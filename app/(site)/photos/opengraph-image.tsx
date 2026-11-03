import { getPhotos } from '@/lib/content'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'
import { SITE } from '@/lib/site'

export const alt = `Photos by ${SITE.name}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** The gallery's share image: the newest landscape photo. */
export default function Image() {
  const photos = getPhotos()
  const photo = photos.find((p) => p.width > p.height) ?? photos[0]
  return renderOgImage({
    title: 'Photos',
    eyebrow: `${photos.length} photographs`,
    photo: photo?.src,
  })
}
