import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons'
import type { PostMeta } from '@/lib/types'
import styles from './post-nav.module.css'

/** Links to the previous (older) and next (newer) posts. */
export function PostNav({ older, newer }: { older: PostMeta | null; newer: PostMeta | null }) {
  if (!older && !newer) return null
  return (
    <nav aria-label="More posts" className={styles.nav}>
      {older ? (
        <Link className={styles.link} href={`/${older.slug}`} prefetch>
          <span className={styles.label}>
            <ArrowLeftIcon size={14} /> Previous
          </span>
          <span className={styles.title}>{older.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {newer ? (
        <Link className={`${styles.link} ${styles.next}`} href={`/${newer.slug}`} prefetch>
          <span className={styles.label}>
            Next <ArrowRightIcon size={14} />
          </span>
          <span className={styles.title}>{newer.title}</span>
        </Link>
      ) : null}
    </nav>
  )
}
