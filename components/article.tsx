import Link from 'next/link'
import { PostImage } from '@/components/post-image'
import { Prose } from '@/components/prose'
import { formatDate } from '@/lib/format'
import type { Post } from '@/lib/types'
import styles from './article.module.css'

/** A full post or page: date and categories, title, hero image, body, and tags. */
export function Article({ post }: { post: Post }) {
  const { meta, html, hero } = post
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        {meta.type === 'post' ? (
          <p className={styles.meta}>
            <time dateTime={meta.date}>{formatDate(meta.date)}</time>
            {meta.categories?.map((category) => (
              <span key={category}>
                {' · '}
                <Link href={`/category/${encodeURIComponent(category)}`} prefetch>
                  {category}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
        <h1 className={styles.title}>{meta.title}</h1>
      </header>

      {hero ? (
        <PostImage
          alt={meta.title}
          className={styles.hero}
          image={hero}
          preload
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
