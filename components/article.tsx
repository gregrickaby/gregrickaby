import Link from 'next/link'

import { MetaLine } from '@/components/meta-line'
import { PostImage } from '@/components/post-image'
import { Prose } from '@/components/prose'
import { formatShortDate } from '@/lib/format'
import type { Post } from '@/lib/types'

import styles from './article.module.css'

/**
 * A full post or page: date, reading time, and categories, then the title,
 * hero image, body, and tags. On the home page the hero banner owns the `h1`,
 * so the article title drops to `h2` there.
 */
export function Article({ post, heading = 'h1' }: { post: Post; heading?: 'h1' | 'h2' }) {
  const { meta, html, hero } = post
  const Title = heading
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        {meta.type === 'post' ? (
          <MetaLine
            className={styles.meta}
            items={[
              <time dateTime={meta.date} key="date">
                {formatShortDate(meta.date)}
              </time>,
              meta.readingMinutes ? `${meta.readingMinutes} min read` : null,
              ...(meta.categories ?? []).map((category) => (
                <Link href={`/category/${encodeURIComponent(category)}`} key={category} prefetch>
                  {category}
                </Link>
              )),
            ]}
          />
        ) : null}
        <Title className={styles.title}>{meta.title}</Title>
      </header>

      {hero ? (
        <PostImage
          alt={meta.title}
          className={styles.hero}
          image={hero}
          priority
          sizes="(max-width: 1100px) 100vw, 1100px"
          slug={meta.slug}
        />
      ) : null}

      <Prose html={html} />

      {meta.tags?.length ? (
        <footer className={styles.footer}>
          <ul className={styles.tags} role="list">
            {meta.tags.map((tag) => (
              <li key={tag}>
                <Link className={styles.tag} href={`/tag/${encodeURIComponent(tag)}`} prefetch>
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </article>
  )
}
