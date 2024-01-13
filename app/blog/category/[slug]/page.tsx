import LatestPosts from '@/components/LatestPosts'
import config from '@/lib/config'
import getCategoryBySlug from '@/lib/queries/getCategoryBySlug'
import {Metadata} from 'next'
import {notFound} from 'next/navigation'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const runtime = 'edge'

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
  const slug = params.slug

  return {
    title: `${slug} Archives - ${config.siteName}`,
    description: `The post archive for ${slug}`,
    alternates: {
      canonical: `${config.siteUrl}/category/${slug}`
    },
    openGraph: {
      title: `${slug} Archives - ${config.siteName}`,
      description: `The post archive for ${slug}`,
      url: `${config.siteUrl}/category/${slug}`
    }
  }
}

/**
 * The category archive.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function CategoryArchive({
  params
}: {
  params: {slug: string}
}) {
  // Fetch posts from WordPress.
  const posts = await getCategoryBySlug(params.slug, 100)

  // No posts? Throw a 404.
  if (!posts) {
    notFound()
  }

  return <LatestPosts title={`Post Category: ${params.slug}`} posts={posts} />
}
