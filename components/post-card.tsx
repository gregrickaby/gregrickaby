import type { Route } from 'next'
import Link from 'next/link'
import { MetaLine } from '@/components/meta-line'
import { PostImage } from '@/components/post-image'
import { formatShortDate } from '@/lib/format'
import type { PostMeta } from '@/lib/types'
import styles from './post-card.module.css'

/** A post's image, title, and description, linking to the post. */
export function PostCard({
  post,
  sizes,
  preload = false,
}: {
  post: PostMeta
  /** The image's `sizes`, which depends on the grid it sits in. */
  sizes: string
  preload?: boolean
}) {
  const href = `/${post.slug}` as Route
  return (
    <article className={styles.card}>
      {post.featuredImage ? (
        <Link aria-hidden="true" className={styles.imageLink} href={href} prefetch tabIndex={-1}>
          <PostImage
            alt=""
            className={styles.image}
            image={post.featuredImage}
            preload={preload}
            sizes={sizes}
            slug={post.slug}
          />
        </Link>
      ) : null}
      <MetaLine
        items={[
          <time dateTime={post.date} key="date">
            {formatShortDate(post.date)}
          </time>,
          post.readingMinutes ? `${post.readingMinutes} min read` : null,
        ]}
      />
      <h2 className={styles.title}>
        <Link href={href} prefetch>
          {post.title}
        </Link>
      </h2>
      {post.description ? <p className={styles.description}>{post.description}</p> : null}
    </article>
  )
}
