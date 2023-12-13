import LatestPosts from '@/components/LatestPosts'
import getPosts from '@/lib/queries/getPosts'
import {notFound} from 'next/navigation'

/**
 * The blog archive.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Blog() {
  // Fetch posts from WordPress.
  const posts = await getPosts(150)

  // No posts? Throw a 404.
  if (!posts) {
    notFound()
  }

  return <LatestPosts posts={posts} />
}
