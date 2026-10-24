import type { Route } from 'next'

/** Site name, copy, and links. */
export const SITE = {
  name: 'Greg Rickaby',
  description: 'Alabama-based software engineer, self-taught photographer, and published author.',
  url: 'https://gregrickaby.com',
  author: {
    name: 'Greg Rickaby',
    url: 'https://gregrickaby.com',
    email: 'greg@gregrickaby.com',
    linkedin: 'https://www.linkedin.com/in/gregrickaby/',
    github: 'https://github.com/gregrickaby',
    goodreads: 'https://www.goodreads.com/author/show/16999736.Greg_Rickaby',
    /** The reader profile behind the author page; its shelves have RSS feeds. */
    goodreadsUserId: '91475042',
  },
  license: {
    name: 'CC BY-NC-ND 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
  },
} as const

/** The home page banner: one of the gallery photos, and the line under the name. */
export const HOME = {
  photo: 'Morning_Mist_–_Lake_Frank_Jackson_20240413.jpg',
  /** Beside "Behind the camera". A post image, so its size is set here. */
  cameraPhoto: {
    src: '/content/posts/the-moons-of-2023/DSC0312_Camera-Setup-For-The-Moon_20240110.jpg',
    alt: 'A camera and telephoto lens on a gimbal head atop a tripod, with trees in the background',
    width: 1707,
    height: 2560,
  },
  roles: ['Software engineer', 'Photographer', 'Author'],
  summary: 'Building for the web since 1997',
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
