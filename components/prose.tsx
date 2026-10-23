import { CodeCopy } from '@/components/islands/code-copy'
import { Lightbox } from '@/components/islands/lightbox'

/**
 * Post or page HTML. `scripts/build-content.ts` sanitizes it with an allowlist
 * at build time, so it is injected as-is. Images inside open in the lightbox,
 * and code blocks get a working copy button.
 */
export function Prose({ html }: { html: string }) {
  return (
    <Lightbox>
      <CodeCopy>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </CodeCopy>
    </Lightbox>
  )
}
