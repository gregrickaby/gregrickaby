import { Demo } from '@/components/demo'
import { CodeCopy } from '@/components/islands/code-copy'
import { Lightbox } from '@/components/islands/lightbox'
import { splitDemos } from '@/lib/html'

/**
 * Post or page HTML. `scripts/build-content.ts` sanitizes it with an allowlist
 * at build time, so it is injected as-is. Images inside open in the lightbox,
 * and code blocks get a working copy button. In a post (given its `slug`),
 * demo markers split the HTML into runs, with each demo rendered between them.
 */
export function Prose({ html, slug }: { html: string; slug?: string }) {
  const parts = splitDemos(html)
  return (
    <Lightbox>
      <CodeCopy>
        {slug && parts.some((part) => 'demo' in part) ? (
          <div className="prose">
            {parts.map((part, i) =>
              'demo' in part ? (
                <Demo key={i} name={part.demo} slug={slug} />
              ) : (
                <div
                  className="prose-run"
                  dangerouslySetInnerHTML={{ __html: part.html }}
                  key={i}
                />
              ),
            )}
          </div>
        ) : (
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </CodeCopy>
    </Lightbox>
  )
}
