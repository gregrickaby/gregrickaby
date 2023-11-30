import SinglePost from '@/components/SinglePost'
import config from '@/lib/config'
import getPostBySlug from '@/lib/queries/getPostBySlug'
import getPosts from '@/lib/queries/getPosts'
import {Metadata} from 'next'
import {notFound} from 'next/navigation'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const dynamicParams = true
export const dynamic = 'force-dynamic'
export const revalidate = 3600

/**
 * Generate the static routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Get blog posts.
  const posts = await getPosts()

  // No posts? Bail...
  if (!posts) {
    return []
  }

  // Return the slugs for each post.
  return posts.map((post: {slug: string}) => ({
    slug: post.slug
  }))
}

/**
 * Generate the metadata for each static route at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({
  params
}: {
  params: {slug: string}
}): Promise<Metadata | null> {
  // Get the blog post.
  const post = await getPostBySlug(params.slug)

  // No post? Bail...
  if (!post) {
    return {}
  }

  return {
    title: `${post.title} - ${config.siteName}`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} - ${config.siteName}`,
      description: post.excerpt,
      url: `${config.siteUrl}/blog/${params.slug}`,
      siteName: config.siteName,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: post?.featuredImage?.node?.mediaDetails?.sizes[0]?.sourceUrl,
          width: post?.featuredImage?.node?.mediaDetails?.sizes[0]?.width,
          height: post?.featuredImage?.node?.mediaDetails?.sizes[0]?.height,
          alt: post.title
        }
      ]
    }
  }
}

/**
 * Single blog post route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Post({params}: {params: {slug: string}}) {
  // Fetch a single post from WordPress.
  const post = await getPostBySlug(params.slug)

  // Get latest blog posts.
  const latestPosts = await getPosts(3)

  // No post? Throw a 404.
  if (!post) {
    notFound()
  }

  return <SinglePost post={post} latestPosts={latestPosts} />
}
