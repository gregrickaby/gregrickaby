import paths from '@/.generated/paths.json'
import type { KnownPaths } from '@/lib/types'

const known = paths as KnownPaths
const POSTS = new Set(known.posts)
const SECTIONS = new Map([
  ['tag', new Set(known.tags)],
  ['category', new Set(known.categories)],
])

/*
 * Top-level routes a single segment can also reach. Files (anything with a
 * dot) and the root Open Graph image pass through on their own.
 */
const ROUTES = new Set(['api', 'blog', 'contact', 'geocities', 'photos', 'resume', 'search'])

function decode(segment: string): string | null {
  try {
    return decodeURIComponent(segment).toLowerCase()
  } catch {
    return null
  }
}

/**
 * Whether a post, tag, or category URL names nothing. A `notFound()` in those
 * pages sends an empty HTML document that only JavaScript fills, so
 * `proxy.ts` sends these to the 404 page before they render.
 *
 * @param pathname - The request path, still percent-encoded.
 * @returns True for `/no-such-post` or `/tag/no-such-tag`; false for anything
 *   that has a page, or any other path.
 */
export function isMissingPath(pathname: string): boolean {
  const [first = '', second, ...rest] = pathname.slice(1).split('/')
  if (second === undefined) {
    if (first === '' || first.includes('.') || first.startsWith('opengraph-image')) return false
    return !ROUTES.has(first) && !POSTS.has(first)
  }
  const names = SECTIONS.get(first)
  if (!names || rest.length > 0) return false
  const name = decode(second)
  return name === null || !names.has(name)
}
