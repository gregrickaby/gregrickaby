import {formatDate} from '@/lib/functions'
import {Post} from '@/lib/types'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import styles from './ArticleCard.module.css'

/**
 * Article Card component.
 */
export function ArticleCard({post}: {post: Post}) {
  return (
    <article
      className={clsx('not-prose', styles.card)}
      key={post.id}
      data-testid="article-card"
    >
      <div className={styles.wrap}>
        <div className={styles.imageWrap}>
          <Link href={`/blog/${post.slug}`}>
            <Image
              alt={post.title.rendered}
              className={styles.image}
              height={192}
              src={post.featured_image_data.url}
              width={594}
            />
          </Link>
        </div>

        <div className={styles.inner}>
          <div className={styles.meta}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
          <Link className={styles.title} href={`/blog/${post.slug}`}>
            <h3 dangerouslySetInnerHTML={{__html: post.title.rendered}} />
          </Link>
          <div
            className={styles.excerpt}
            dangerouslySetInnerHTML={{__html: post.excerpt.rendered}}
          />
        </div>
      </div>
    </article>
  )
}
