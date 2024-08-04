import config from '@/lib/config'
import clsx from 'clsx'
import {createElement} from 'react'
import styles from './SocialLinks.module.css'

interface SocialLink {
  name: string
  url: string
  icon?: React.ElementType
}

/**
 * Social links component.
 */
export function SocialLinks() {
  return (
    <div className={styles.socialLinks} data-testid="social-links">
      {config.socials.map((social: SocialLink) => (
        <a
          aria-label={`follow on ${social.name}`}
          className={clsx('button', styles.socialButton)}
          href={social.url}
          key={social.name}
          rel="author"
          title={`Follow on ${social.name}`}
        >
          {social.icon && createElement(social.icon)}
        </a>
      ))}
    </div>
  )
}
