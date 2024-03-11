import MorePosts from '@/components/MorePosts'
import PostList from '@/components/PostList'
import config from '@/lib/config'
import getTagBySlug from '@/lib/queries/getTagBySlug'
import getTags from '@/lib/queries/getTags'
import type {GenerateMetadataProps} from '@/lib/types'
import {Metadata} from 'next'
import {notFound} from 'next/navigation'

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
  return tags.edges.map(({node}) => ({
    slug: node.slug
  }))
}

/**
 * Generate the metadata for each static route at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({
  params
}: GenerateMetadataProps): Promise<Metadata | null> {
  return {
    title: `${params.slug} Archive - ${config.siteName}`,
    description: `The blog archive for the ${params.slug} tag.`,
    alternates: {
      canonical: `${config.siteUrl}/blog/tag/${params.slug}`
    },
    openGraph: {
      title: `${params.slug} Archive - ${config.siteName}`,
      description: `The blog archive for the ${params.slug} tag.`,
      url: `${config.siteUrl}/blog/tag/${params.slug}`
    }
  }
}

/**
 * The tag archive route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function TagArchive({
  params
}: Readonly<{params: {slug: string}}>) {
  // Fetch posts from WordPress.
  const posts = await getTagBySlug(params.slug, 12)

  // No posts? Throw a 404.
  if (!posts) {
    notFound()
  }

  return (
    <>
      <h1 className="capitalize">{params.slug} Archive</h1>
      <PostList posts={posts} />
      <MorePosts endCursor={posts.pageInfo.endCursor} />
    </>
  )
}
