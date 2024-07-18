import {Post} from '@/lib/types'

/**
 * Get all posts from the WordPress REST API with pagination.
 */
export async function getAllPosts(): Promise<Post[]> {
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
 * Get a post from the WordPress REST API by slug.
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  // Remove "/blog/" from the slug.
  slug = slug.replace(/^\/blog\//, '')

  try {
    const response = await fetch(
      `https://blog.gregrickaby.com/wp-json/wp/v2/posts?slug=${slug}&_fields=id,date,slug,status,title,excerpt,content,acf,category_names,tag_names,featured_image_data,yoast_head_json`,
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
