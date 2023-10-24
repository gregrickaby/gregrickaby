import config from '@/lib/config'
import React from 'react'

/**
 * Social links component.
 */
export default function SocialLinks() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {config.socials.map((social) => (
        <a
          aria-label={`View Greg's ${social.name}`}
          className="rounded bg-zinc-900 p-3 text-2xl text-white shadow-lg transition-colors duration-200 hover:bg-zinc-700"
          href={social.url}
          key={social.name}
          rel="author"
        >
          {social.icon && React.createElement(social.icon)}
        </a>
      ))}
    </div>
  )
}
