import {getPosts} from '@/lib/api'
import config from '@/lib/config'
import {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export function generateMetadata(): Metadata {
  return {
    title: `Blog - ${config.siteName}`,
    description:
      'Welcome to my blog. Here you will find posts dating back to 2013.'
  }
}

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
    <article className="article">
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
