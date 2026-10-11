import { currentRole, resumeSummary } from '@/lib/resume'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const alt = 'Resume'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** The resume's share image: the current role, on plain charcoal. */
export default function Image() {
  return renderOgImage({
    title: `${currentRole.role}, ${currentRole.company}`,
    eyebrow: `Resume · On the web since ${resumeSummary.since}`,
  })
}
