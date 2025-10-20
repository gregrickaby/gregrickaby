import {WP_Query} from '@/lib/api/WP_Query'
import {sanitizeText} from '@/lib/functions/sanitizeText'
import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Generate metadata for the blog index.
 */
export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest blog posts'
}

/**
 * Blog Index Page - Lists all blog posts.
 */
export default async function BlogIndex() {
  // Setup the query for blog posts.
  const query = new WP_Query({
    post_type: 'posts',
    per_page: 100,
    orderby: 'date',
    order: 'desc'
  })

  // Get the posts.
  const posts = await query.getPosts()

  // No posts? Show a message.
  if (!posts || posts.length === 0) {
    return (
      <div className="px-12 lg:px-0">
        <h1 className="mb-8">Blog</h1>
        <p>No blog posts found.</p>
      </div>
    )
  }

  return (
    <div className="px-12 lg:px-0">
      <h1 className="mb-8">Blog</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: any) => (
          <article
            key={post.id}
            className="overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={`/blog/${post.slug}`}>
              {post.featured_image_data?.url && (
                <div className="relative h-48 w-full">
                  <Image
                    alt={sanitizeText(post.title.rendered)}
                    className="object-cover"
                    fill
                    src={post.featured_image_data.url}
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="mb-2 text-xl font-bold">
                  {sanitizeText(post.title.rendered)}
                </h2>
                {post.excerpt?.rendered && (
                  <div
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeText(post.excerpt.rendered)
                    }}
                  />
                )}
                {post.date && (
                  <time className="mt-2 block text-xs text-gray-500">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                )}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
