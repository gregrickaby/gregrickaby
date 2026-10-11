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
  'title' | 'slug' | 'date' | 'modified' | 'type' | 'description' | 'featuredImage'
>

/**
 * Build a Next.js Metadata object for any post or page.
 *
 * Handles featured image path resolution, parent OG image inheritance,
 * URL construction from SITE, canonical alternate, and OG type
 * inference (article fields are emitted automatically for posts).
 *
 * @param meta - The post or page frontmatter fields consumed by this function.
 * @param canonicalPath - Absolute path from root, e.g. '/about' or '/my-post'.
 * @param parent - The ResolvingMetadata passed into generateMetadata by Next.js.
 * @returns A fully-formed Metadata object ready to return from generateMetadata.
 */
export async function buildContentMetadata(
  meta: ContentMetaInput,
  canonicalPath: string,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const featuredImage = meta.featuredImage?.src
  const previousImages = (await parent).openGraph?.images ?? []

  const published = validDate(meta.date)
  const modified = validDate(meta.modified)

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE.url}${canonicalPath}`,
      images: [
        ...(featuredImage ? [{ url: `${SITE.url}${featuredImage}` }] : []),
        ...previousImages,
      ],
      ...(meta.type === 'post' && {
        type: 'article',
        ...(published && { publishedTime: published }),
        ...(modified && { modifiedTime: modified }),
      }),
    },
  }
}
