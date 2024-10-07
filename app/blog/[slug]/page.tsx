import {Blocks} from '@/components/Blocks'
import {Comments} from '@/components/Comments'
import {formatDate} from '@/lib/functions'
import {WP_Query} from '@/lib/rest'
import {fetchComments} from '@/lib/rest/comments'
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

  // No page? No problem.
  if (!post) {
    return notFound()
  }

  return seoRest(post)
}

/**
 * Blog Post.
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

  // Get the post by slug.
  const [post] = await query.getPosts()

  // No post? No problem.
  if (!post) {
    return notFound()
  }

  // Fetch comments.
  const comments = await fetchComments(post.id)

  return (
    <article className="prose mx-auto max-w-3xl px-12 lg:prose-xl dark:prose-invert lg:px-0">
      <header>
        <h1 dangerouslySetInnerHTML={{__html: post.title.rendered}} />
        <div className="font-sans text-sm">
          Published to{' '}
          <span className="font-bold">
            {post.category_names.map((category) => category.name).join(', ')}
          </span>{' '}
          on <time>{formatDate(post.date)} </time>
        </div>
      </header>
      <Blocks content={post.content.rendered} />
      <footer>
        <p className="font-bold">
          Tagged with:{' '}
          <span className="font-normal">
            {post.tag_names.map((tag) => tag.name).join(', ')}
          </span>
        </p>
      </footer>
      <Comments comments={comments} postId={post.id} />
    </article>
  )
}
