import config from '@/lib/config'
import {createElement} from 'react'

/**
 * Social links component.
 */
export function SocialLinks() {
  return (
    <div
      className="flex flex-wrap justify-center gap-4 pb-4"
      data-testid="social-links"
    >
      {config.socials.map((social) => (
        <a
          aria-label={`follow on ${social.name}`}
          className="button"
          href={social.url}
          key={social.name}
          rel="author"
          title={`Follow on ${social.name}`}
        >
          {!!social.icon && createElement(social.icon)}
        </a>
      ))}
    </div>
  )
}
