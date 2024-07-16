interface Post {
  id: number
  slug: string
  title: {
    rendered: string
  }
}

/**
 * Get all posts from the WordPress REST API with pagination.
 */
async function getAllPosts(): Promise<Post[]> {
  try {
    const response = await fetch(
      'https://blog.gregrickaby.com/wp-json/wp/v2/posts?per_page=100&_fields=id,slug,title',
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
      throw new Error('No posts found')
    }

    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Blog Archive.
 */
export default async function BlogArchive() {
  const posts = await getAllPosts()

  if (!posts) {
    return <p>No posts found</p>
  }

  return (
    <>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <a
              href={`/blog/${post.slug}`}
              dangerouslySetInnerHTML={{__html: post.title.rendered}}
            />
          </li>
        ))}
      </ul>
    </>
  )
}
