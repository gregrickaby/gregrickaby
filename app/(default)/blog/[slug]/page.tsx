import {Blocks} from '@/components/Blocks/Blocks'
import {Byline} from '@/components/Byline/Byline'
import {WP_Query} from '@/lib/api/WP_Query'
import {fetchPostBySlug} from '@/lib/functions/fetchPostBySlug'
import {sanitizeText} from '@/lib/functions/sanitizeText'
import {yoastSeo} from '@/lib/functions/yoastSeo'
import type {Metadata} from 'next'
import Image from 'next/image'

/**
 * Page props.
 */
interface PageProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * Generate all blog post routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Setup the query for blog posts.
  const query = new WP_Query({
    post_type: 'posts',
    per_page: 100,
    fields: ['slug']
  })

  // Get the posts.
  const posts = await query.getPosts()

  // No posts? Bail...
  if (!posts) {
    return []
  }

  // Return the slugs for each post.
  return posts.map((post: {slug: string}) => ({
    slug: post.slug
  }))
}

/**
 * Generate metadata for the blog post.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(
  props: Readonly<PageProps>
): Promise<Metadata> {
  const params = await props.params
  const post = await fetchPostBySlug(params.slug)
  return yoastSeo(post)
}

/**
 * Single Blog Post.
 */
export default async function BlogPost(props: Readonly<PageProps>) {
  const params = await props.params
  const post = await fetchPostBySlug(params.slug)

  return (
    <article className="article px-12 lg:px-0">
      <header className="mb-8">
        {post.featured_image_data?.url && (
          <div className="mb-6">
            <Image
              alt={post.title.rendered}
              className="rounded-lg shadow-lg"
              height={400}
              src={post.featured_image_data.url}
              width={800}
              priority
            />
          </div>
        )}

        <h1 className="mb-4">{sanitizeText(post.title.rendered)}</h1>

        <Byline post={post} />

        {post.category_names?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.category_names.map((category) => (
              <span
                key={category.id}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
      </header>

      <Blocks content={post.content.rendered} />

      {post.tag_names?.length > 0 && (
        <footer className="mt-8 border-t pt-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Tags:</span>
            {post.tag_names.map((tag) => (
              <span
                key={tag.id}
                className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-600"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  )
}
