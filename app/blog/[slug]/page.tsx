import SinglePost from '@/components/SinglePost'
import {notFoundSeoHandler, seoHandler} from '@/lib/functions'
import getPostBySlug from '@/lib/queries/getPostBySlug'
import getPosts from '@/lib/queries/getPosts'
import type {GenerateMetadataProps} from '@/lib/types'
import {Metadata} from 'next'
import {notFound} from 'next/navigation'

/**
 * Generate the static routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Get all blog posts.
  const posts = await getPosts(1000)

  // No posts? Bail...
  if (!posts.edges.length) {
    return []
  }

  // Return the slugs for each post.
  return posts.edges.map(({node}) => ({
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
  // Get the blog post.
  const post = await getPostBySlug(params.slug)

  // No post? Return 404 metadata.
  if (!post) {
    return notFoundSeoHandler(params.slug)
  }

  return seoHandler(post)
}

/**
 * The single post route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Post({
  params
}: Readonly<{params: {slug: string}}>) {
  // Fetch a single post from WordPress.
  const post = await getPostBySlug(params.slug)

  // No post? Throw a 404.
  if (!post) {
    notFound()
  }

  return <SinglePost post={post} />
}
