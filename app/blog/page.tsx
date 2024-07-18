import {getAllPosts} from '@/lib/api'
import {notFound} from 'next/navigation'

/**
 * Blog Archive.
 */
export default async function BlogArchive() {
  // Get all posts.
  const posts = await getAllPosts()

  // No posts? No problem.
  if (!posts) {
    return notFound()
  }

  return (
    <>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <a
              href={`/blog/${post.slug}`}
              dangerouslySetInnerHTML={{__html: post.title.rendered}}
            />
          </li>
        ))}
      </ul>
    </>
  )
}
