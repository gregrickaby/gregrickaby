/**
 * Site-wide configuration constants including the site name, description,
 * URL, author details, and navigation links.
 *
 * @constant
 */
export const siteConfig = {
  name: 'Greg Rickaby',
  description:
    'Alabama-based software engineer, self-taught photographer, and published author.',
  url: 'https://gregrickaby.com',
  author: {
    name: 'Greg Rickaby',
    url: 'https://gregrickaby.com/about',
    linkedin: 'https://www.linkedin.com/in/gregrickaby/',
    github: 'https://github.com/gregrickaby'
  },
  nav: [
    {label: 'About', href: '/about', priority: 0.8},
    {label: 'Contact', href: '/contact', priority: 0.6},
    {label: 'Photos', href: '/photos', priority: 0.6},
    {label: 'Resume', href: '/resume', priority: 0.8},
    {label: 'RSS', href: '/feed.xml', external: true}
  ]
} as const

/**
 * Type representing the full site configuration object.
 */
export type SiteConfig = typeof siteConfig

/**
 * Scroll offset (in pixels) past which the header switches to its compact
 * "scrolled" padding. Shared between `Header` and `MobileDrawer` so the
 * drawer's top offset stays in sync with the header's actual height.
 */
export const HEADER_SCROLL_THRESHOLD = 50

/** A single entry in `siteConfig.nav`. */
export type NavLink = SiteConfig['nav'][number]

/**
 * Checks whether a nav link points to an external destination (e.g. the RSS feed).
 *
 * @param link - A nav link from `siteConfig.nav`.
 * @returns True if the link is external.
 */
export function isExternalNavLink(link: NavLink): boolean {
  return 'external' in link && link.external === true
}
