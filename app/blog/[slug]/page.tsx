import {Byline} from '@/components'
import {Blocks} from '@/components/Blocks'
import {Comments} from '@/components/Comments'
import {WP_Query} from '@/lib/api'
import {fetchComments} from '@/lib/api/comments'
import {sanitizeText, yoastSeo} from '@/lib/functions'
import {IconFolder, IconTags} from '@tabler/icons-react'
import {notFound} from 'next/navigation'

/**
 * Blog Post props.
 */
interface BlogPostProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * Generate all routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Setup the query.
  const query = new WP_Query({
    post_type: 'posts',
    per_page: 100,
    _fields: ['slug']
  })

  // Get the posts by slug.
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
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: BlogPostProps) {
  const params = await props.params
  // Setup the query.
  const query = new WP_Query({
    post_type: 'posts',
    slug: params.slug,
    _fields: ['content', 'title', 'yoast_head_json']
  })

  // Get the post by slug.
  const [post] = await query.getPosts()

  // No post? No problem.
  if (!post) {
    return notFound()
  }

  return yoastSeo(post)
}

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export default async function BlogPost(props: Readonly<BlogPostProps>) {
  const params = await props.params
  // Setup the query.
  const query = new WP_Query({
    slug: params.slug,
    _fields: [
      'acf',
      'author_gravatar_url',
      'author_name',
      'category_names',
      'content',
      'date',
      'featured_image_data',
      'id',
      'modified',
      'slug',
      'tag_names',
      'title',
      'yoast_head_json'
    ]
  })

  // Get the post by slug.
  const [post] = await query.getPosts()

  // No post? No problem.
  if (!post) {
    return notFound()
  }

  // Fetch the comments for the post.
  const comments = await fetchComments(post.id)

  return (
    <article
      className="prose mx-auto max-w-3xl px-12 lg:prose-xl dark:prose-invert lg:px-0"
      itemScope
      itemType="https://schema.org/Article"
    >
      <header className="mb-16">
        {/* Article featured image */}
        {!post.acf.hide_featured_image && (
          <img
            alt={post.featured_image_data.alt}
            className="full-width"
            height={post.featured_image_data.height}
            itemProp="image"
            loading="eager"
            src={post.featured_image_data.url}
            width={post.featured_image_data.width}
          />
        )}

        {/* Article title */}
        <h1 itemProp="headline">{sanitizeText(post.title.rendered)}</h1>

        {/* Article byline */}
        <Byline post={post} />
      </header>

      {/* Main article content */}
      <div itemProp="articleBody">
        <Blocks content={post.content.rendered} />
      </div>

      <footer className="border-b pb-8 pt-4 dark:border-gray-900">
        <div className="flex items-center gap-2">
          <IconFolder />
          <span className="sr-only">catergorized in</span>
          {post.category_names.map((category, index) => (
            <span key={category.id} itemProp="articleSection">
              {category.name}
              {index < post.category_names.length - 1 && ', '}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <IconTags />
          <span className="sr-only">tagged with</span>
          <span itemProp="keywords">
            {post.tag_names.map((tag) => tag.name).join(', ')}
          </span>
        </div>
      </footer>

      {/* Comments section */}
      <Comments comments={comments} postId={post.id} />
    </article>
  )
}
