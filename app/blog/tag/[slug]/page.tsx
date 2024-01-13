import LatestPosts from '@/components/LatestPosts'
import {notFoundSeoHandler, seoHandler} from '@/lib/functions'
import getPostBySlug from '@/lib/queries/getPostBySlug'
import getTagBySlug from '@/lib/queries/getTagBySlug'
import getTags from '@/lib/queries/getTags'
import {GenerateMetadataProps} from '@/lib/types'
import {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const runtime = 'nodejs'

/**
 * Generate the static routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Get all tags.
  const tags = await getTags(100)

  // No tags? Bail...
  if (!tags.edges.length) {
    return []
  }

  // Return the slugs for each tag.
  return tags.edges.map((node) => ({
    slug: node.slug
  }))
}

/**
 * Generate the metadata for each static route at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(
  {params, searchParams}: GenerateMetadataProps,
  parent: ResolvingMetadata
): Promise<Metadata | null> {
  // Get the blog post.
  const post = await getPostBySlug(params.slug)

  // No post? Return 404 metadata.
  if (!post) {
    return notFoundSeoHandler(params.slug)
  }

  return seoHandler(post)
}

/**
 * The tag archive.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function TagArchive({params}: {params: {slug: string}}) {
  // Fetch posts from WordPress.
  const posts = await getTagBySlug(params.slug, 100)

  // No posts? Throw a 404.
  if (!posts) {
    notFound()
  }

  return <LatestPosts title={`Post Tag: ${params.slug}`} posts={posts} />
}
