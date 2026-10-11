import type { Route } from 'next'

/** Site name, copy, and links. */
export const SITE = {
  name: 'Greg Rickaby',
  description: 'Alabama-based software engineer, self-taught photographer, and published author.',
  url: 'https://gregrickaby.com',
  author: {
    name: 'Greg Rickaby',
    url: 'https://gregrickaby.com',
    linkedin: 'https://www.linkedin.com/in/gregrickaby/',
    github: 'https://github.com/gregrickaby',
  },
  license: {
    name: 'CC BY-NC-ND 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
  },
} as const

/** The home page banner: one of the gallery photos, and the line under the name. */
export const HOME = {
  photo: 'Morning_Mist_–_Lake_Frank_Jackson_20240413.jpg',
  roles: ['Software engineer', 'Photographer', 'Author'],
  summary: 'Building for the web since 1997.',
} as const

/** A header link. External links open in a new tab and stay out of the sitemap. */
export interface NavLink {
  label: string
  href: Route
  /** Sitemap priority. */
  priority?: number
  external?: boolean
}

export const NAV: readonly NavLink[] = [
  { label: 'Blog', href: '/blog', priority: 0.8 },
  { label: 'Contact', href: '/contact', priority: 0.6 },
  { label: 'Photos', href: '/photos', priority: 0.6 },
  { label: 'Resume', href: '/resume', priority: 0.8 },
  { label: 'RSS', href: '/feed.xml', external: true },
]
