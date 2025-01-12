import {formatDate} from '@/lib/functions/formatDate'
import {sanitizeText} from '@/lib/functions/sanitizeText'
import {Post} from '@/lib/types'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import styles from './ArticleCard.module.css'

/**
 * Article Card component.
 */
export function ArticleCard({post}: Readonly<{post: Post}>) {
  return (
    <Link
      className={clsx('not-prose', styles.card)}
      href={`/blog/${post.slug}`}
      key={post.id}
    >
      <article data-testid="article-card">
        <div className={styles.wrap}>
          <div className={styles.imageWrap}>
            <Image
              alt={post.title.rendered}
              className={styles.image}
              height={192}
              src={post.featured_image_data.url}
              width={594}
            />
          </div>

          <div className={styles.inner}>
            <div className={styles.meta}>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>

            <h3 className={styles.title}>
              {sanitizeText(post.title.rendered)}
            </h3>

            <div className={styles.excerpt}>
              {sanitizeText(post.excerpt.rendered)}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
