import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons'
import { SoundNav } from '@/components/islands/sound-nav'
import { PostImage } from '@/components/post-image'
import type { PostMeta } from '@/lib/types'

import styles from './post-nav.module.css'

/**
 * A "Continue?" screen at the end of a post: cards linking to the previous
 * (older) and next (newer) posts, as wide as the hero. A card shows the post's
 * featured image when it has one.
 */
export function PostNav({ older, newer }: { older: PostMeta | null; newer: PostMeta | null }) {
  if (!older && !newer) return null
  return (
    <SoundNav aria-label="More posts" className={styles.nav} clickSound="select">
      <p className={styles.heading}>Continue?</p>
      {older ? (
        <NavCard
          label={
            <>
              <ArrowLeftIcon size={14} /> Previous level
            </>
          }
          post={older}
        />
      ) : null}
      {newer ? (
        <NavCard
          className={styles.next}
          label={
            <>
              Next level <ArrowRightIcon size={14} />
            </>
          }
          post={newer}
        />
      ) : null}
    </SoundNav>
  )
}

function NavCard({
  post,
  label,
  className,
}: {
  post: PostMeta
  label: ReactNode
  className?: string
}) {
  return (
    <Link
      className={className ? `${styles.card} ${className}` : styles.card}
      href={`/${post.slug}`}
      prefetch
    >
      {post.featuredImage ? (
        <PostImage
          alt=""
          className={styles.image}
          image={post.featuredImage}
          sizes="(max-width: 40rem) 100vw, 550px"
          slug={post.slug}
        />
      ) : null}
      <span className={styles.label}>{label}</span>
      <span className={styles.title}>{post.title}</span>
    </Link>
  )
}
