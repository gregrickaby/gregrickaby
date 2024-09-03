import {Gallery} from '@/components/Gallery'
import {getThreads} from '@/lib/api'
import {IconBrandThreads} from '@tabler/icons-react'

import config from '@/lib/config'
import {Metadata} from 'next'

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export function generateMetadata(): Metadata {
  return {
    title: `Photos - ${config.siteName}`,
    description: 'My latest photos.'
  }
}

/**
 * The photos page route.
 */
export default async function Photos() {
  // Get the most recent Threads photos.
  const threads = await getThreads(120)

  return (
    <article className="article">
      <h1 className="flex items-center gap-2">
        Photos{' '}
        <a
          aria-label="follow on Threads"
          className="button"
          href="https://www.threads.net/@gregoryrickaby"
          rel="noopener noreferrer"
          title="Follow on Threads"
        >
          <IconBrandThreads />
        </a>
      </h1>

      <Gallery photos={threads} />
    </article>
  )
}
