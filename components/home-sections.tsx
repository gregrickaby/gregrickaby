import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRightIcon } from '@/components/icons'
import { Lightbox } from '@/components/islands/lightbox'
import { MetaLine } from '@/components/meta-line'
import { PostCard } from '@/components/post-card'
import { Prose } from '@/components/prose'
import { exifSummary } from '@/lib/format'
import { splitSections } from '@/lib/html'
import { fullImageUrl } from '@/lib/images'
import { resumeEntries } from '@/lib/resume'
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
      <header className={styles.bandHeader}>
        <div>
          <MetaLine items={[label]} />
          <h2 className={styles.bandTitle} id={id}>
            {title}
          </h2>
        </div>
        <Link className={styles.more} href={more.href}>
          {more.text} <ArrowRightIcon size={16} />
        </Link>
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
    <section aria-labelledby="about-title" className={styles.about}>
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
 * The About page's photography section as a band: the story across the top,
 * the gear lists in columns beneath, and the affiliate note in small print.
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
      <div className={styles.gear}>
        <Prose html={photography.html} />
      </div>
      {disclaimer ? (
        <aside aria-label="Affiliate disclaimer" className={styles.disclaimer}>
          <Prose html={disclaimer.html} />
        </aside>
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
      <ol className={styles.strip} role="list">
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
              sizes="(max-width: 640px) 80vw, 420px"
              src={photo.src}
              width={photo.width}
            />
          </a>
        ))}
      </Lightbox>
    </Band>
  )
}
