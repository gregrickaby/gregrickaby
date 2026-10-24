import Link from 'next/link'

import { LikeButton } from '@/components/islands/like-button'
import { SoundNav } from '@/components/islands/sound-nav'
import { TableOfContents } from '@/components/islands/table-of-contents'
import { MetaLine } from '@/components/meta-line'
import { PostImage } from '@/components/post-image'
import { Prose } from '@/components/prose'
import { formatShortDate } from '@/lib/format'
import type { Post } from '@/lib/types'

import styles from './article.module.css'

/**
 * A full post or page: date, reading time, and categories, then the title,
 * hero image, and body. A post also gets a table of contents and like button,
 * in a sticky sidebar on wide screens (the contents above the body and the
 * button below it on narrow ones), and its tags. On the home page the hero
 * banner owns the `h1`, so the article title drops to `h2` there.
 */
export function Article({ post, heading = 'h1' }: { post: Post; heading?: 'h1' | 'h2' }) {
  const { meta, html, headings, hero } = post
  const Title = heading
  return (
    <article className={styles.article}>
      {meta.type === 'post' ? <div aria-hidden="true" className={styles.progress} /> : null}
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

      {meta.type === 'post' ? (
        <div className={styles.body}>
          <aside className={styles.aside}>
            <div className={styles.sidebar}>
              {headings.length > 0 ? <TableOfContents headings={headings} /> : null}
              <div className={styles.sideLike}>
                <LikeButton slug={meta.slug} />
              </div>
            </div>
          </aside>
          <Prose html={html} />
          {/* The narrow-screen copy, after the body so focus order matches what readers see. */}
          <div className={styles.endLike}>
            <LikeButton slug={meta.slug} />
          </div>
        </div>
      ) : (
        <Prose html={html} />
      )}

      {meta.tags?.length ? (
        <footer className={styles.footer}>
          <SoundNav aria-label="Tags" clickSound="select">
            <ul className={styles.tags} role="list">
              {meta.tags.map((tag) => (
                <li key={tag}>
                  <Link className={styles.tag} href={`/tag/${encodeURIComponent(tag)}`} prefetch>
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </SoundNav>
        </footer>
      ) : null}
    </article>
  )
}
