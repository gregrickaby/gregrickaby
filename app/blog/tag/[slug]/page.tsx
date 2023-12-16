import LatestPosts from '@/components/LatestPosts'
import getTagBySlug from '@/lib/queries/getTagBySlug'
import {notFound} from 'next/navigation'

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
