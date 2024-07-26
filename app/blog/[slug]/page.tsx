import {getPostBySlug} from '@/lib/api'
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
 * Blog Post.
 */
export default async function BlogPost({params}: BlogPostProps) {
  // Get the post by slug.
  const post = await getPostBySlug(params.slug)

  // No post? No problem.
  if (!post) {
    return notFound()
  }

  return (
    <article className="prose mx-auto max-w-3xl px-12 lg:prose-xl dark:prose-invert lg:px-0">
      <header>
        <h1
          className="not-prose mb-6 font-title text-3xl font-bold lg:text-6xl lg:leading-[1.1]"
          dangerouslySetInnerHTML={{__html: post.title.rendered}}
        />
        <div className="font-sans text-sm">
          Published to{' '}
          <span className="font-bold">
            {post.category_names.map((category) => category.name).join(', ')}
          </span>{' '}
          on <time className="font-bold">{formatDate(post.date)} </time>
        </div>
      </header>
      <div
        className="font-serif"
        dangerouslySetInnerHTML={{__html: post.content.rendered}}
      />
      <footer>
        <p className="font-bold">
          Tagged with:{' '}
          <span className="font-normal">
            {post.tag_names.map((tag) => tag.name).join(', ')}
          </span>
        </p>
      </footer>
    </article>
  )
}
