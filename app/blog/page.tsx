import {getPosts} from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'

/**
 * Blog Archive.
 */
export default async function BlogArchive() {
  // Get all posts.
  const posts = await getPosts()

  // No posts? No problem.
  if (!posts) {
    return notFound()
  }

  return (
    <>
      <h1>Blog</h1>
      <div className="not-prose grid grid-cols-3 gap-4">
        {posts.map((post) => (
          <article key={post.id}>
            <Link className="flex flex-col gap-4" href={`/blog/${post.slug}`}>
              {post.featured_image_data.url && (
                <Image
                  alt={post.featured_image_data.alt || ''}
                  className=""
                  height={post.featured_image_data.height}
                  src={post.featured_image_data.url}
                  width={post.featured_image_data.width}
                />
              )}
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
