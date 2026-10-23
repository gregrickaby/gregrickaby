import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'
import { HOME, SITE } from '@/lib/site'

export const alt = `${SITE.name}: ${HOME.roles.join(', ')}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** The default share image, also used by pages without their own. */
export default function Image() {
  return renderOgImage({
    title: SITE.name,
    eyebrow: HOME.roles.join(' · '),
    photo: `/content/photos/${HOME.photo}`,
    byline: false,
  })
}
