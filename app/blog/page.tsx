import LatestPosts from '@/components/LatestPosts'
import config from '@/lib/config'
import getPosts from '@/lib/queries/getPosts'
import {notFound} from 'next/navigation'
import {Metadata} from 'next/types'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const runtime = 'nodejs'

/**
 * Generate the metadata for this archive.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({
  params
}: {
  params: {slug: string}
}): Promise<Metadata | null> {
  return {
    title: `Latest Posts - ${config.siteName}`,
    description: `The latest blog posts from ${config.siteName}`,
    alternates: {
      canonical: `${config.siteUrl}/blog`
    },
    openGraph: {
      title: `Latest Posts - ${config.siteName}`,
      description: `The latest blog posts from ${config.siteName}`,
      url: `${config.siteUrl}/blog`
    }
  }
}

/**
 * The blog archive.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Blog() {
  // Fetch posts from WordPress.
  const posts = await getPosts(15)

  // No posts? Throw a 404.
  if (!posts) {
    notFound()
  }

  return <LatestPosts posts={posts} />
}
