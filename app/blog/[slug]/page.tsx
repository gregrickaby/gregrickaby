import {getPostBySlug} from '@/lib/api'
import {formatDate} from '@/lib/functions'

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
    return <p>Post not found</p>
  }

  return (
    <article>
      <header>
        <h1 dangerouslySetInnerHTML={{__html: post.title.rendered}} />
        <time className="italic">Posted on {formatDate(post.date)}</time>
      </header>
      <div dangerouslySetInnerHTML={{__html: post.content.rendered}} />
      <footer>
        <p className="font-bold">
          Filed under:{' '}
          <span className="font-normal">
            {post.category_names.map((category) => category.name).join(', ')}
          </span>
        </p>
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
