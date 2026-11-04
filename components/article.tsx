import Link from 'next/link'

import { SoundNav } from '@/components/islands/sound-nav'
import { TableOfContents } from '@/components/islands/table-of-contents'
import { MetaLine } from '@/components/meta-line'
import { PostActions } from '@/components/post-actions'
import { PostImage } from '@/components/post-image'
import { Prose } from '@/components/prose'
import { exifSummary, formatShortDate } from '@/lib/format'
import { SITE } from '@/lib/site'
import type { Post } from '@/lib/types'

import styles from './article.module.css'

/**
 * A full post or page: date (and the update date, when it falls on another
 * day), reading time, and categories, then the title, hero image, and body.
 * A hero with EXIF gets its exposure and a photo credit under it, as on the
 * home page banner. A post also gets a toolbar above the body (share and copy
 * Markdown) and one after it that adds the reactions, a table of contents in a
 * sticky sidebar on wide screens (above the body on narrow ones), and its
 * tags. On the home page the hero banner owns the `h1`, so the article title
 * drops to `h2` there.
 */
export function Article({ post, heading = 'h1' }: { post: Post; heading?: 'h1' | 'h2' }) {
  const { meta, html, headings, hero } = post
  const Title = heading
  const settings = hero ? exifSummary({ ...hero, camera: undefined, lens: undefined }) : ''
  return (
    <article className={styles.article}>
      {meta.type === 'post' ? <div aria-hidden="true" className={styles.progress} /> : null}
      <header className={styles.header}>
        {meta.type === 'post' ? (
          <MetaLine
            className={styles.meta}
            items={[
              meta.draft ? 'Draft' : null,
              <time dateTime={meta.date} key="date">
                {formatShortDate(meta.date)}
              </time>,
              formatShortDate(meta.modified) === formatShortDate(meta.date) ? null : (
                <span key="modified">
                  Updated <time dateTime={meta.modified}>{formatShortDate(meta.modified)}</time>
                </span>
              ),
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
        <figure className={styles.hero}>
          <PostImage
            alt={meta.title}
            className={styles.heroImage}
            image={hero}
            priority
            sizes="(max-width: 68.75rem) 100vw, 68.75rem"
            slug={meta.slug}
          />
          {settings ? (
            <figcaption>
              <MetaLine className={styles.credit} items={[settings, `Credit: ${SITE.name}`]} />
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      {meta.type === 'post' ? (
        <div className={styles.body}>
          <PostActions meta={meta} placement="top" />
          {headings.length > 0 ? (
            <aside className={styles.aside}>
              <div className={styles.sidebar}>
                <TableOfContents headings={headings} />
              </div>
            </aside>
          ) : null}
          <Prose html={html} slug={meta.slug} />
          <PostActions meta={meta} placement="end" />
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
