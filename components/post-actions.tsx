import type { ComponentType } from 'react'

import {
  FacebookIcon,
  LinkedInIcon,
  MailIcon,
  RedditIcon,
  ShareIcon,
  XIcon,
} from '@/components/icons'
import { CopyLink } from '@/components/islands/copy-link'
import { CopyMarkdown } from '@/components/islands/copy-markdown'
import { DeviceShare } from '@/components/islands/device-share'
import { Reactions } from '@/components/islands/reactions'
import { SITE } from '@/lib/site'
import type { PostMeta } from '@/lib/types'

import styles from './post-actions.module.css'
import tooltip from './tooltip.module.css'

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
 * A post's toolbar, above the body and again after it: a Share button that
 * opens every way to share the post, the reactions (after the body only, where
 * the reader has finished), then the copy Markdown button at the end. The
 * share menu is a native popover of plain links to each site's share page, so
 * it works without JavaScript and loads nothing from those sites. `placement`
 * says which copy this is, and keeps the two menus' ids apart.
 */
export function PostActions({
  meta,
  placement,
}: {
  meta: Pick<PostMeta, 'slug' | 'title'>
  placement: 'top' | 'end'
}) {
  const link = `${SITE.url}/${meta.slug}`
  const url = encodeURIComponent(link)
  const title = encodeURIComponent(meta.title)
  const menuId = `share-${placement}`
  return (
    <div className={styles.toolbar}>
      <button className={styles.action} popoverTarget={menuId} type="button">
        <ShareIcon size={20} />
        Share
      </button>
      <div className={styles.menu} id={menuId} popover="auto">
        <ul aria-label="Share this post" role="list">
          <li>
            <CopyLink className={styles.item} url={link} />
          </li>
          {SHARE_SITES.map(({ name, Icon, href }) => (
            <li key={name}>
              <a
                className={styles.item}
                href={href(url, title)}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon size={20} />
                {name}
              </a>
            </li>
          ))}
          <li>
            <a className={styles.item} href={`mailto:?subject=${title}&body=${url}`}>
              <MailIcon size={20} />
              Email
            </a>
          </li>
          <li>
            <DeviceShare className={styles.item} title={meta.title} url={link} />
          </li>
        </ul>
      </div>
      {placement === 'end' ? <Reactions slug={meta.slug} /> : null}
      <CopyMarkdown className={`${tooltip.tip} ${tooltip.end} ${styles.icon}`} slug={meta.slug} />
    </div>
  )
}
