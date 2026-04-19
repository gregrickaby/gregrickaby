import type {PostMeta} from './types'

/** Matches numeric HTML entities like &#38; */
const NUMERIC_ENTITY_RE = /&#(\d+);/g

/** Matches relative src attributes like src="./filename" */
const RELATIVE_SRC_RE = /src="\.\/([^"]+)"/g

/** Matches a leading ./ path prefix */
const RELATIVE_PREFIX_RE = /^\.\//

/** Matches the first img src attribute in an HTML string */
const FIRST_IMG_SRC_RE = /<img[^>]+src="([^"]+)"/

/**
 * Decodes numeric HTML entities (e.g. `&#38;` → `&`) in a string.
 *
 * @param str - A string potentially containing numeric HTML entities.
 * @returns The decoded string.
 */
export function decodeEntities(str: string): string {
  return str.replaceAll(NUMERIC_ENTITY_RE, (_, code: string) =>
    String.fromCodePoint(Number.parseInt(code, 10))
  )
}

/**
 * Normalises raw gray-matter frontmatter into a typed `PostMeta` object,
 * decoding any numeric HTML entities in the title and description fields.
 *
 * @param data - The raw frontmatter object returned by gray-matter.
 * @returns A correctly typed and decoded `PostMeta` value.
 */
export function normalizeMeta(data: Record<string, unknown>): PostMeta {
  const meta = {...data} as unknown as PostMeta
  if (typeof meta.title === 'string') meta.title = decodeEntities(meta.title)
  if (typeof meta.description === 'string')
    meta.description = decodeEntities(meta.description)
  return meta
}

/**
 * Rewrites relative image `src` attributes in rendered HTML so they resolve
 * correctly from the public directory.
 *
 * @param htmlContent - Rendered HTML that may contain `src="./filename"` references.
 * @param slug - The post or page slug, used to construct the base path.
 * @param type - Whether the content is a `'post'` or `'page'`.
 * @returns The HTML with all relative image paths resolved to absolute public paths.
 */
export function resolveImagePaths(
  htmlContent: string,
  slug: string,
  type: string
): string {
  const basePath =
    type === 'post' ? `/content/posts/${slug}` : `/content/pages/${slug}`
  return htmlContent.replaceAll(RELATIVE_SRC_RE, `src="${basePath}/$1"`)
}

/**
 * Formats an ISO date string into a human-readable date.
 *
 * @param dateString - An ISO 8601 date string (e.g. `'2024-06-01T00:00:00Z'`).
 * @returns A formatted string such as `'June 1, 2024'`.
 */
export function formatPostDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(dateString))
}

/**
 * Resolves the public path to a post or page's featured image.
 *
 * @param meta - The post or page metadata.
 * @returns The absolute-from-root image path, or `null` when no featured image is set.
 */
export function getFeaturedImagePath(meta: PostMeta): string | null {
  if (!meta.featuredImage) return null
  const basePath =
    meta.type === 'post'
      ? `/content/posts/${meta.slug}`
      : `/content/pages/${meta.slug}`
  return `${basePath}/${meta.featuredImage.replace(RELATIVE_PREFIX_RE, '')}`
}

/**
 * Returns the `src` of the first `<img>` element found in an HTML string.
 *
 * @param html - Rendered HTML content from a post.
 * @returns The image `src` value, or `null` when no image is present.
 */
export function getFirstContentImageSrc(html: string): string | null {
  const match = FIRST_IMG_SRC_RE.exec(html)
  return match ? match[1] : null
}

/**
 * Resolves the featured image path to render above article content.
 *
 * Returns null if:
 * - No featured image is set in metadata
 * - The featured image path matches the first image src in the rendered content
 *   (prevents showing the same image twice)
 *
 * @param meta - The post or page metadata.
 * @param content - The rendered HTML content string.
 * @returns The featured image path to display, or null when it should be suppressed.
 */
export function resolveFeaturedImage(
  meta: PostMeta,
  content: string
): string | null {
  const featured = getFeaturedImagePath(meta)
  if (!featured) return null
  if (featured === getFirstContentImageSrc(content)) return null
  return featured
}

/**
 * Returns the caption text for an image element.
 * Prefers the text of an enclosing `<figcaption>`, falling back to the `alt` attribute.
 *
 * @param img - The image DOM element.
 * @returns The caption string, or an empty string when none is found.
 */
export function getCaption(img: HTMLImageElement): string {
  const fig = img.closest('figure')
  return fig?.querySelector('figcaption')?.textContent ?? img.alt
}

/**
 * Escapes user-supplied strings before inserting into an HTML context.
 *
 * @param value - The raw string to escape.
 * @returns A string safe for use in HTML attributes and text content.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;')
}

/**
 * Formats an ISO date string into a short human-readable date for photo cards.
 *
 * @param dateString - An ISO 8601 date string (e.g. `'2024-06-01T00:00:00Z'`).
 * @returns A formatted string such as `'Jun 1, 2024'`.
 */
export function formatPhotoDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(dateString))
}
