import LatestPosts from '@/components/LatestPosts'
import getPosts from '@/lib/queries/getPosts'
import {notFound} from 'next/navigation'

/**
 * The home page route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Home() {
  // Fetch posts from WordPress.
  const posts = await getPosts(15)

  // No posts? Throw a 404.
  if (!posts) {
    notFound()
  }

  return <LatestPosts posts={posts} />
}
