import type { Metadata, ResolvingMetadata } from 'next'

import { validDate } from './format'
import { SITE } from './site'
import type { PostMeta } from './types'

/**
 * The subset of PostMeta fields consumed by buildContentMetadata.
 * Defined as a Pick so the function signature documents exactly what it needs.
 */
type ContentMetaInput = Pick<
  PostMeta,
  'title' | 'slug' | 'date' | 'modified' | 'type' | 'description'
>

/**
 * Open Graph fields every page shares. A page's `openGraph` replaces the root
 * layout's whole object instead of merging into it, so each builder repeats them.
 */
export const OPEN_GRAPH_BASE = {
  locale: 'en_US',
  siteName: SITE.name,
  type: 'website',
} as const

/**
 * Metadata for a page with no Markdown behind it, such as the blog index or a
 * tag archive. The share image comes from the nearest opengraph-image route.
 */
export async function buildPageMetadata(
  { title, description, path }: { title: string; description: string; path: string },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images ?? []
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      title,
      description,
      url: path === '/' ? SITE.url : `${SITE.url}${path}`,
      images: previousImages,
    },
  }
}

/**
 * Build a Next.js Metadata object for any post or page.
 *
 * Handles parent OG image inheritance,
 * URL construction from SITE, canonical alternate, and OG type
 * inference (article fields are emitted automatically for posts). Posts also
 * link their Markdown copy at `/<slug>.md`; other pages pass `markdownPath`.
 *
 * @param meta - The post or page frontmatter fields consumed by this function.
 * @param canonicalPath - Absolute path from root, e.g. '/about' or '/my-post'.
 * @param parent - The ResolvingMetadata passed into generateMetadata by Next.js.
 * @param markdownPath - The page's Markdown copy, linked as `text/markdown`.
 * @returns A fully-formed Metadata object ready to return from generateMetadata.
 */
export async function buildContentMetadata(
  meta: ContentMetaInput,
  canonicalPath: string,
  parent: ResolvingMetadata,
  markdownPath = meta.type === 'post' ? `/${meta.slug}.md` : undefined,
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images ?? []

  const published = validDate(meta.date)
  const modified = validDate(meta.modified)

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalPath,
      ...(markdownPath && { types: { 'text/markdown': markdownPath } }),
    },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      title: meta.title,
      description: meta.description,
      url: `${SITE.url}${canonicalPath}`,
      // Share images come from the opengraph-image routes; keep the inherited one.
      images: previousImages,
      ...(meta.type === 'post' && {
        type: 'article',
        ...(published && { publishedTime: published }),
        ...(modified && { modifiedTime: modified }),
      }),
    },
  }
}
