interface Post {
  id: number
  slug: string
  title: {
    rendered: string
  }
  date: string
  content: {
    rendered: string
  }
}

async function getBlogBySlug(slug: string): Promise<Post> {
  // Remove "/blog/" from the slug.
  slug = slug.replace(/^\/blog\//, '')

  try {
    const response = await fetch(
      `https://blog.gregrickaby.com/wp-json/wp/v2/posts?slug=${slug}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'force-cache',
        next: {revalidate: 3600}
      }
    )

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data: Post[] = await response.json()

    if (data.length === 0) {
      throw new Error('Post not found')
    }

    return data[0]
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Blog Post.
 */
export default async function BlogPost({params}: {params: {slug: string}}) {
  const post = await getBlogBySlug(params.slug)

  if (!post) {
    return <p>Post not found</p>
  }

  return (
    <article className="overflow-clip">
      <h1 dangerouslySetInnerHTML={{__html: post.title.rendered}} />
      <time>
        Posted on{' '}
        {new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
      <div dangerouslySetInnerHTML={{__html: post.content.rendered}} />
    </article>
  )
}
