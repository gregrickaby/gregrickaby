import MorePosts from '@/components/MorePosts'
import PostList from '@/components/PostList'
import {notFoundSeoHandler, seoHandler} from '@/lib/functions'
import getCategories from '@/lib/queries/getCategories'
import getCategoryBySlug from '@/lib/queries/getCategoryBySlug'
import getPostBySlug from '@/lib/queries/getPostBySlug'
import {GenerateMetadataProps} from '@/lib/types'
import {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'

/**
 * Generate the static routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Get all categories.
  const categories = await getCategories(100)

  // No categories? Bail...
  if (!categories.edges.length) {
    return []
  }

  // Return the slugs for each category.
  return categories.edges.map((node) => ({
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
 * The category archive route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function CategoryArchive({
  params
}: {
  params: {slug: string}
}) {
  // Fetch posts from WordPress.
  const posts = await getCategoryBySlug(params.slug, 12)

  // No posts? Throw a 404.
  if (!posts) {
    notFound()
  }

  return (
    <>
      <h1>Category: {params.slug}</h1>
      <PostList posts={posts} />
      <MorePosts endCursor={posts.pageInfo.endCursor} />
    </>
  )
}
