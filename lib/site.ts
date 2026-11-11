import type { Route } from 'next'

/**
 * The emoji a visitor can react to a post with, in the order the toolbar shows
 * them. A visitor gives a post one. Likes from before reactions count as hearts.
 */
export const REACTIONS = [
  { id: 'heart', emoji: '❤️', name: 'Like' },
  { id: 'laugh', emoji: '😂', name: 'Laugh' },
  { id: 'wow', emoji: '🤯', name: 'Wow' },
  { id: 'fire', emoji: '🔥', name: 'Fire' },
] as const

export type ReactionId = (typeof REACTIONS)[number]['id']

/** Every reaction this site has, at zero. */
export function buildEmptyCounts(): Record<ReactionId, number> {
  return Object.fromEntries(REACTIONS.map(({ id }) => [id, 0])) as Record<ReactionId, number>
}

/** Narrows form input to a reaction this site has. */
export function isReactionId(value: unknown): value is ReactionId {
  return REACTIONS.some((reaction) => reaction.id === value)
}

/** Site name, copy, and links. */
export const SITE = {
  name: 'Greg Rickaby',
  description: 'Alabama-based software engineer, self-taught photographer, and published author.',
  url: 'https://gregrickaby.com',
  author: {
    name: 'Greg Rickaby',
    url: 'https://gregrickaby.com',
    email: 'gregrickaby@duck.com',
    linkedin: 'https://www.linkedin.com/in/gregrickaby/',
    github: 'https://github.com/gregrickaby',
    goodreads: 'https://www.goodreads.com/author/show/16999736.Greg_Rickaby',
    /** The public profile that lists what Greg is reading, linked from the home page. */
    goodreadsProfile: 'https://www.goodreads.com/gregrickaby',
    /** The reader profile behind the author page, which lists what Greg is reading. */
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
  roles: ['Software engineer', 'Photographer', 'Author'],
  summary: 'Building for the web since 1997',
} as const

/** The photo beside the gear lists on /gear. A post image, so its size is set here. */
export const GEAR_PHOTO = {
  src: '/content/posts/the-moons-of-2023/DSC0312_Camera-Setup-For-The-Moon_20240110.jpg',
  alt: 'A camera and telephoto lens on a gimbal head atop a tripod, with trees in the background',
  width: 1707,
  height: 2560,
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
