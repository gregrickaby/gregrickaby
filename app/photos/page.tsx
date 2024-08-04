import {getThreads} from '@/lib/api'
import {IconBrandThreads} from '@tabler/icons-react'

/**
 * The photos page route.
 */
export default async function Photos() {
  const threads = await getThreads(120)

  return (
    <article className="article">
      <h1 className="flex items-center gap-2">
        Recent Photos{' '}
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
      <div className="columns-1 gap-5 sm:columns-2 sm:gap-8 md:columns-3 lg:columns-4 [&>img:not(:first-child)]:mt-8">
        {threads.data.map((thread) =>
          // If there is not a media_url, skip this iteration.
          !thread.media_url ? null : (
            <a key={thread.id} href={thread.media_url}>
              <img alt={thread.text} src={thread.media_url} loading="lazy" />
            </a>
          )
        )}
      </div>
    </article>
  )
}
