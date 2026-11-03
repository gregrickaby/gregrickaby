import { PostCard } from '@/components/post-card'
import type { PostMeta } from '@/lib/types'

import styles from './post-grid.module.css'

// Matches the column widths in post-grid.module.css at a 75rem page.
const FEATURED_SIZES = '(max-width: 56.25rem) 100vw, 36.875rem'
const REST_SIZES = '(max-width: 42.5rem) 100vw, (max-width: 62.5rem) 50vw, 24.375rem'

/** Posts as cards. The first two are larger, in two columns; the rest use three. */
export function PostGrid({ posts }: { posts: PostMeta[] }) {
  const featured = posts.slice(0, 2)
  const rest = posts.slice(2)
  return (
    <div className={styles.stack}>
      <div className={styles.featured}>
        {featured.map((post) => (
          <PostCard key={post.slug} post={post} preload sizes={FEATURED_SIZES} />
        ))}
      </div>
      {rest.length > 0 ? (
        <div className={styles.rest}>
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} sizes={REST_SIZES} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
