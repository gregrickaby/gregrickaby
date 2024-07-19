import {getPosts} from '@/lib/api'
import Link from 'next/link'
import {notFound} from 'next/navigation'

/**
 * Blog Archive.
 */
export default async function BlogArchive() {
  // Get all posts.
  const posts = await getPosts(100)

  // No posts? No problem.
  if (!posts) {
    return notFound()
  }

  return (
    <>
      <h1>Blog</h1>
      <div className="not-prose flex flex-col gap-4">
        {posts.map((post) => (
          <article key={post.id}>
            <Link className="" href={`/blog/${post.slug}`}>
              <h2
                className="text-xl hover:underline"
                dangerouslySetInnerHTML={{__html: post.title.rendered}}
              />
            </Link>
          </article>
        ))}
      </div>
    </>
  )
}
