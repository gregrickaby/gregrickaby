import config from '@/lib/config'
import React from 'react'

/**
 * Social links component.
 */
export default function SocialLinks() {
  return (
    <div className="flex flex-wrap justify-center gap-4 pb-4">
      {config.socials.map((social) => (
        <a
          aria-label={`follow on ${social.name}`}
          className="rounded bg-zinc-900 p-1 text-2xl text-white transition-colors duration-200 hover:bg-zinc-700"
          href={social.url}
          key={social.name}
          rel="author"
          title={`Follow on ${social.name}`}
        >
          {!!social.icon && React.createElement(social.icon)}
        </a>
      ))}
    </div>
  )
}
