import {Blocks} from '@/components/Blocks'
import {Comments} from '@/components/Comments'
import {WP_Query} from '@/lib/api'
import {fetchComments} from '@/lib/api/comments'
import {formatDate, yoastSeo} from '@/lib/functions'
import {notFound} from 'next/navigation'

/**
 * Blog Post props.
 */
interface BlogPostProps {
  params: {
    slug: string
  }
}

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({params}: BlogPostProps) {
  // Setup the query.
  const query = new WP_Query({
    post_type: 'posts',
    slug: params.slug,
    fields: ['content', 'title', 'yoast_head_json']
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
export default async function BlogPost({params}: Readonly<BlogPostProps>) {
  // Setup the query.
  const query = new WP_Query({
    slug: params.slug,
    fields: [
      'category_names',
      'content',
      'date',
      'id',
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
        <h1
          dangerouslySetInnerHTML={{__html: post.title.rendered}}
          itemProp="headline"
        />

        {/* Article metadata */}
        <div className="flex items-center justify-start gap-2 text-base">
          <img
            alt={post.author_name}
            className="not-prose rounded-full"
            height={56}
            loading="lazy"
            src={post.author_gravatar_url}
            width={56}
          />
          <div>
            By{' '}
            <address
              className="inline not-italic"
              itemScope
              itemType="http://schema.org/Person"
              itemProp="author"
            >
              <span itemProp="name">{post.author_name}</span>
            </address>{' '}
            <div>
              <span className="text-sm">
                Published{' '}
                <time
                  dateTime={post.date_gmt}
                  itemProp="datePublished"
                  content={post.date_gmt}
                >
                  {formatDate(post.date)}
                </time>
              </span>
              {post.modified && post.modified !== post.date && (
                <span className="font-sans text-sm italic">
                  {' '}
                  (Updated{' '}
                  <time
                    dateTime={post.modified_gmt}
                    itemProp="dateModified"
                    content={post.modified_gmt}
                  >
                    {formatDate(post.modified)})
                  </time>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main article content */}
      <div itemProp="articleBody">
        <Blocks content={post.content.rendered} />
      </div>

      <footer className="border-b border-t">
        <p className="font-bold">
          Category:{' '}
          {post.category_names.map((category, index) => (
            <span
              className="font-normal"
              key={category.id}
              itemProp="articleSection"
            >
              {category.name}
              {index < post.category_names.length - 1 && ', '}
            </span>
          ))}
        </p>
        <p className="font-bold">
          Tags:{' '}
          <span className="font-normal" itemProp="keywords">
            {post.tag_names.map((tag) => tag.name).join(', ')}
          </span>
        </p>
      </footer>

      {/* Comments section */}
      <Comments comments={comments} postId={post.id} />
    </article>
  )
}
