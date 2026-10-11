import { Lightbox } from '@/components/islands/lightbox'

/**
 * Post or page HTML. `scripts/build-content.ts` sanitizes it with an allowlist
 * at build time, so it is injected as-is. Images inside open in the lightbox.
 */
export function Prose({ html }: { html: string }) {
  return (
    <Lightbox>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </Lightbox>
  )
}
