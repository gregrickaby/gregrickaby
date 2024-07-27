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
    <article className="prose mx-auto max-w-3xl px-12 lg:prose-xl dark:prose-invert lg:px-0">
      <h1>Blog</h1>
      <div className="not-prose flex flex-col gap-4">
        {posts.map((post) => (
          <article key={post.id}>
            <Link
              className="underline hover:no-underline"
              href={`/blog/${post.slug}`}
            >
              <h2
                className="text-xl"
                dangerouslySetInnerHTML={{__html: post.title.rendered}}
              />
            </Link>
          </article>
        ))}
      </div>
    </article>
  )
}
