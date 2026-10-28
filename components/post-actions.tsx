import type { ComponentType } from 'react'

import { FacebookIcon, LinkedInIcon, RedditIcon, XIcon } from '@/components/icons'
import { CopyLink } from '@/components/islands/copy-link'
import { CopyMarkdown } from '@/components/islands/copy-markdown'
import { LikeButton } from '@/components/islands/like-button'
import { SITE } from '@/lib/site'
import type { PostMeta } from '@/lib/types'

import styles from './post-actions.module.css'

interface ShareSite {
  name: string
  Icon: ComponentType<{ size?: number }>
  /** The site's share URL for a post's URL and title, both encoded. */
  href: (url: string, title: string) => string
}

const SHARE_SITES: ShareSite[] = [
  {
    name: 'Reddit',
    Icon: RedditIcon,
    href: (url, title) => `https://www.reddit.com/submit?url=${url}&title=${title}`,
  },
  {
    name: 'LinkedIn',
    Icon: LinkedInIcon,
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  },
  {
    name: 'Facebook',
    Icon: FacebookIcon,
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  },
  {
    name: 'X',
    Icon: XIcon,
    href: (url, title) => `https://x.com/intent/tweet?url=${url}&text=${title}`,
  },
]

/**
 * A row of icons to copy a post's Markdown or link, or share it, each with a tooltip,
 * and the like button under them. Share links are plain links to each site's
 * share page, so they work without JavaScript and load nothing from those sites.
 */
export function PostActions({ meta }: { meta: Pick<PostMeta, 'slug' | 'title'> }) {
  const link = `${SITE.url}/${meta.slug}`
  const url = encodeURIComponent(link)
  const title = encodeURIComponent(meta.title)
  return (
    <div className={styles.actions}>
      <ul aria-label="Copy or share this post" className={styles.icons} role="list">
        <li>
          <CopyMarkdown className={styles.icon} slug={meta.slug} />
        </li>
        <li>
          <CopyLink className={styles.icon} url={link} />
        </li>
        {SHARE_SITES.map(({ name, Icon, href }) => (
          <li key={name}>
            <a
              aria-label={`Share on ${name}`}
              className={styles.icon}
              data-tip={`Share on ${name}`}
              href={href(url, title)}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon size={22} />
            </a>
          </li>
        ))}
      </ul>
      <LikeButton slug={meta.slug} />
    </div>
  )
}
