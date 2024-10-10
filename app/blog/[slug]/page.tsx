import {Blocks} from '@/components/Blocks'
import {Comments} from '@/components/Comments'
import {WP_Query} from '@/lib/api'
import {fetchComments} from '@/lib/api/comments'
import {formatDate} from '@/lib/functions'
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
export default async function BlogPost({params}: Readonly<BlogPostProps>) {
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

  const [post] = await query.getPosts()

  if (!post) {
    return notFound()
  }

  const comments = await fetchComments(post.id)

  return (
    <article
      className="prose mx-auto max-w-3xl px-12 lg:prose-xl dark:prose-invert lg:px-0"
      itemScope
      itemType="https://schema.org/Article"
    >
      <header>
        <h1
          dangerouslySetInnerHTML={{__html: post.title.rendered}}
          itemProp="headline"
        />
        <div className="font-sans text-sm">
          Published by{' '}
          <address
            className="inline font-bold not-italic"
            itemScope
            itemType="http://schema.org/Person"
          >
            <span itemProp="name">{post.author_name}</span>
          </address>{' '}
          in{' '}
          <span className="font-bold">
            {post.category_names.map((category, index) => (
              <span key={category.id} itemProp="articleSection">
                {category.name}
                {index < post.category_names.length - 1 && ', '}
              </span>
            ))}
          </span>{' '}
          on{' '}
          <time
            dateTime={post.date_gmt}
            itemProp="datePublished"
            content={post.date_gmt}
          >
            {formatDate(post.date)}
          </time>
          {post.modified && post.modified !== post.date && (
            <span className="font-sans text-sm">
              {' '}
              &middot; Updated on{' '}
              <time
                dateTime={post.modified_gmt}
                itemProp="dateModified"
                content={post.modified_gmt}
              >
                {formatDate(post.modified)}
              </time>
            </span>
          )}
        </div>
      </header>

      {/* Main article content */}
      <div itemProp="articleBody">
        <Blocks content={post.content.rendered} />
      </div>

      <footer>
        <p className="font-bold">
          Tagged with:{' '}
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
