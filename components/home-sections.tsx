import type { Route } from 'next'
import Image from 'next/image'
import type { ReactNode } from 'react'

import { ArrowRightIcon } from '@/components/icons'
import { Lightbox } from '@/components/islands/lightbox'
import { SoundRouteLink } from '@/components/islands/sound-route-link'
import { MetaLine } from '@/components/meta-line'
import { PostCard } from '@/components/post-card'
import { Prose } from '@/components/prose'
import { exifSummary } from '@/lib/format'
import type { Book } from '@/lib/goodreads'
import { splitSections } from '@/lib/html'
import { fullImageUrl } from '@/lib/images'
import { resumeEntries } from '@/lib/resume'
import { HOME, SITE } from '@/lib/site'
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

/**
 * The About page's opening beside Greg's family photo. Its later sections
 * (the camera bag and the affiliate note) render in {@link CameraBag}.
 */
export function HomeAbout({ page }: { page: Post }) {
  const [lead] = splitSections(page.html)
  return (
    <section aria-labelledby="about-title" className={styles.about} data-reveal>
      {page.meta.featuredImage ? (
        <Image
          alt="The Rickaby family"
          className={styles.aboutPhoto}
          height={page.meta.featuredImage.height}
          sizes="(max-width: 860px) 100vw, 480px"
          src={page.meta.featuredImage.src}
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

/**
 * The About page's photography section as a band: the story and gear lists
 * beside a photo of the moon rig, and the affiliate note in small print.
 */
export function CameraBag({ page }: { page: Post }) {
  const sections = splitSections(page.html).slice(1)
  const photography = sections.find((s) => s.id === 'photographer')
  const disclaimer = sections.find((s) => s.id === 'affiliate-disclaimer')
  if (!photography) return null

  return (
    <Band
      id="camera-title"
      label="Photography"
      more={{ href: '/photos', text: 'All photos' }}
      title="Behind the camera"
    >
      <div className={styles.camera}>
        <div className={styles.gear}>
          <Prose html={photography.html} />
        </div>
        <Image
          alt={HOME.cameraPhoto.alt}
          className={styles.cameraPhoto}
          height={HOME.cameraPhoto.height}
          sizes="(max-width: 860px) 384px, 360px"
          src={HOME.cameraPhoto.src}
          width={HOME.cameraPhoto.width}
        />
      </div>
      {disclaimer ? (
        <div aria-label="Affiliate disclaimer" className={styles.disclaimer} role="note">
          <Prose html={disclaimer.html} />
        </div>
      ) : null}
    </Band>
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
      <ol aria-labelledby="career-title" className={styles.strip} role="list" tabIndex={0}>
        {resumeEntries.map((entry) => (
          <li className={styles.role} key={`${entry.company}-${entry.dateRange}`}>
            <MetaLine items={[entry.dateRange]} />
            <p className={styles.roleTitle}>{entry.role}</p>
            <p className={styles.company}>{entry.company}</p>
          </li>
        ))}
      </ol>
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
            sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 390px"
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
      more={{ href: SITE.author.goodreads, text: 'Goodreads' }}
      title="On my nightstand"
    >
      <ul className={styles.books} role="list">
        {books.map((book) => (
          <li className={styles.book} data-reveal key={book.url}>
            {book.cover ? (
              <Image
                alt=""
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
  return `(max-width: 640px) ${Math.round(220 * ratio)}px, ${Math.round(280 * ratio)}px`
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
      <Lightbox className={styles.gallery}>
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
              width={photo.width}
            />
          </a>
        ))}
      </Lightbox>
    </Band>
  )
}
