/** Removed posts, pages, and retired tags with no replacement, decoded and lowercase. */
const GONE = new Set([
  '/2013-2014-alabama-hunting-seasons',
  '/adventure-panama-city-florida-2022',
  '/dreamy-milky-way-on-august-8',
  '/ehs-graduation-2023',
  '/faq',
  '/genesis-code-snippets',
  '/happy-little-trees',
  '/home-networking-upgrade',
  '/how-to-install-lamp-on-ubuntu',
  '/mobile-website-statistics-from-2009-through-2013',
  '/movie-theater-popcorn-at-home',
  '/pcb-wheel',
  '/perfect-symmetry',
  '/podcasting-sound-like-a-radio-dj',
  '/recommended-services',
  '/stable-diffusion-xl-1-0-impresses',
  '/sugar-coated-street-art',
  '/summer-vacation-2015-day-one-camp-cracker-barrell',
  '/sunset-around-the-bed',
  '/the-perfect-apc-configuration',
  '/the-perfect-pan-pizza',
  '/we-went-chasing-waterfalls',
  '/webcam',
  '/wordpress-with-apache-2-4-and-php-5-5',
  '/category/photos',
  '/tag/ai',
  '/tag/automatic1111',
  '/tag/disney',
  '/tag/gx85',
  '/tag/hosting',
  '/tag/portrait',
  '/tag/portraits',
  '/tag/snow',
  '/tag/stable diffusion',
  '/tag/ubuntu',
  '/tag/year in review',
])

/*
 * Old WordPress routes: the REST API, the admin, author pages, and date-based
 * post URLs. The date URLs that map to a post redirect in lib/redirects.ts,
 * which runs before the proxy.
 */
const GONE_PATTERNS = [
  /^\/wp-json(\/|$)/,
  /^\/wp-admin(\/|$)/,
  /^\/author\/[^/]+$/,
  /^\/20\d{2}\/\d{2}(\/|$)/,
]

function decode(pathname: string): string {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

/**
 * Whether a path names a page that used to exist and is gone for good.
 * `proxy.ts` answers these with a 410, so search engines drop them.
 *
 * @param pathname - The request path, still percent-encoded.
 */
export function isGonePath(pathname: string): boolean {
  const path = decode(pathname).toLowerCase()
  return GONE.has(path) || GONE_PATTERNS.some((pattern) => pattern.test(path))
}
