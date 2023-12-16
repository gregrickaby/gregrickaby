import LatestPosts from '@/components/LatestPosts'
import getCategoryBySlug from '@/lib/queries/getCategoryBySlug'
import {notFound} from 'next/navigation'

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
