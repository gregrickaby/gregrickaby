import type { Route } from 'next'
import Image from 'next/image'
import type { ReactNode } from 'react'

import { ArrowRightIcon } from '@/components/icons'
import { Lightbox } from '@/components/islands/lightbox'
import { SoundRouteLink } from '@/components/islands/sound-route-link'
import { StripButtons } from '@/components/islands/strip-buttons'
import { MetaLine } from '@/components/meta-line'
import { PostCard } from '@/components/post-card'
import { Prose } from '@/components/prose'
import { exifSummary } from '@/lib/format'
import type { Book } from '@/lib/goodreads'
import { splitSections } from '@/lib/html'
import { aspectRatio, fullImageUrl } from '@/lib/images'
import { resumeEntries } from '@/lib/resume'
import { SITE } from '@/lib/site'
import type { Photo, Post, PostMeta } from '@/lib/types'

import styles from './home-sections.module.css'

/** A home page band: a label and title on the left, a "see all" link on the right. */
function Band({
  id,
  label,
  title,
  more,
  children,
}: {
  id: string
  label: string
  title: string
  more: { href: Route; text: string }
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className={styles.band}>
      <header className={styles.bandHeader} data-reveal>
        <div>
          <MetaLine items={[label]} />
          <h2 className={styles.bandTitle} id={id}>
            {title}
          </h2>
        </div>
        <SoundRouteLink className={styles.more} href={more.href}>
          {more.text} <ArrowRightIcon size={16} />
        </SoundRouteLink>
      </header>
      {children}
    </section>
  )
}

/** The About page's opening beside Greg's family photo. */
export function HomeAbout({ page }: { page: Post }) {
  const [lead] = splitSections(page.html)
  return (
    <section aria-labelledby="about-title" className={styles.about} data-reveal>
      {page.meta.featuredImage ? (
        <Image
          alt={page.meta.featuredImage.alt}
          className={styles.aboutPhoto}
          height={page.meta.featuredImage.height}
          sizes="(max-width: 53.75rem) 100vw, 30rem"
          src={page.meta.featuredImage.src}
          style={aspectRatio(page.meta.featuredImage)}
          width={page.meta.featuredImage.width}
        />
      ) : null}
      <div className={styles.aboutText}>
        <MetaLine items={['About']} />
        <h2 className={styles.bandTitle} id="about-title">
          Hello there
        </h2>
        <Prose html={lead.html} />
      </div>
    </section>
  )
}

/** Each role as a card in a row that scrolls sideways, newest first. */
export function CareerStrip() {
  return (
    <Band
      id="career-title"
      label="Career"
      more={{ href: '/resume', text: 'Full resume' }}
      title="Where I've worked"
    >
      <div className={styles.stripFrame}>
        <ol
          aria-labelledby="career-title"
          className={styles.strip}
          id="career-strip"
          role="list"
          tabIndex={0}
        >
          {resumeEntries.map((entry) => (
            <li className={styles.role} key={`${entry.company}-${entry.dateRange}`}>
              <MetaLine items={[entry.dateRange]} />
              <p className={styles.roleTitle}>{entry.role}</p>
              <p className={styles.company}>{entry.company}</p>
            </li>
          ))}
        </ol>
        <StripButtons controls="career-strip" label="roles" />
      </div>
    </Band>
  )
}

/** The newest posts, side by side. */
export function LatestWriting({ posts }: { posts: PostMeta[] }) {
  return (
    <Band
      id="writing-title"
      label="Writing"
      more={{ href: '/blog', text: 'All posts' }}
      title="Latest from the blog"
    >
      <div className={styles.posts}>
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            sizes="(max-width: 42.5rem) 100vw, (max-width: 62.5rem) 50vw, 24.375rem"
          />
        ))}
      </div>
    </Band>
  )
}

/** Greg's Goodreads "currently-reading" shelf. Renders nothing when the shelf is empty or didn't load. */
export function CurrentlyReading({ books }: { books: Book[] }) {
  if (books.length === 0) return null
  return (
    <Band
      id="reading-title"
      label="Reading"
      more={{ href: SITE.author.goodreadsProfile, text: 'Goodreads' }}
      title="On my nightstand"
    >
      <ul className={styles.books} role="list">
        {books.map((book) => (
          <li className={styles.book} data-reveal key={book.url}>
            {book.cover ? (
              <Image
                alt={`Cover of ${book.title}`}
                className={styles.cover}
                height={475}
                sizes="96px"
                src={book.cover}
                width={316}
              />
            ) : null}
            <div>
              {book.series ? <MetaLine items={[book.series]} /> : null}
              <p className={styles.bookTitle}>
                <a href={book.url}>{book.title}</a>
              </p>
              <p className={styles.company}>{book.author}</p>
            </div>
          </li>
        ))}
      </ul>
    </Band>
  )
}

/**
 * Strip photos have a fixed height (home-sections.module.css), so each one's
 * width follows its aspect ratio. A viewport-based `sizes` overshoots on portraits.
 */
function stripSizes({ width, height }: Photo) {
  const ratio = width / height
  return `(max-width: 40rem) ${toRem(13.75 * ratio)}rem, ${toRem(17.5 * ratio)}rem`
}

/** A rem length to two decimals. */
function toRem(value: number) {
  return Math.round(value * 100) / 100
}

/** Recent photos in a row that scrolls sideways; each opens in the lightbox. */
export function GalleryStrip({ photos }: { photos: Photo[] }) {
  return (
    <Band
      id="gallery-title"
      label="Gallery"
      more={{ href: '/photos', text: 'All photos' }}
      title="Recent photographs"
    >
      <div className={styles.stripFrame}>
        <Lightbox className={styles.gallery} id="gallery-strip">
          {photos.map((photo) => (
            <a
              className={styles.photo}
              data-caption={photo.title}
              data-details={exifSummary(photo) || undefined}
              data-full={fullImageUrl(photo.src, photo.width, photo.hdr)}
              data-lightbox=""
              href={photo.src}
              key={photo.filename}
            >
              <Image
                alt={photo.title}
                className={styles.photoImage}
                height={photo.height}
                sizes={stripSizes(photo)}
                src={photo.src}
                style={aspectRatio(photo)}
                width={photo.width}
              />
            </a>
          ))}
        </Lightbox>
        <StripButtons controls="gallery-strip" label="photos" />
      </div>
    </Band>
  )
}
