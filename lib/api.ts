import {Post} from '@/lib/types'

/**
 * Generic function to query data from the WordPress REST API.
 */
async function query(endpoint: string, query: string): Promise<Post[]> {
  try {
    const response = await fetch(
      `https://blog.gregrickaby.com/wp-json/wp/v2/${endpoint}?${query}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        next: {revalidate: 43200} // 12 hours
      }
    )

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data: Post[] = await response.json()

    if (data.length === 0) {
      throw new Error('No data found')
    }

    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Get all pages.
 */
export async function getAllPages(): Promise<Post[]> {
  return await query(
    'pages',
    'per_page=100&_fields=id,slug,title,yoast_head_json'
  )
}

/**
 * Get all posts.
 */
export async function getAllPosts(): Promise<Post[]> {
  return await query(
    'posts',
    'per_page=100&_fields=id,slug,title,yoast_head_json'
  )
}

/**
 * Get a page by slug.
 */
export async function getPageBySlug(slug: string): Promise<Post> {
  const data = await query(
    'pages',
    `slug=${slug}&_fields=id,date,slug,status,title,excerpt,content,acf,category_names,tag_names,featured_image_data,yoast_head_json`
  )
  return data[0]
}

/**
 * Get a post by slug.
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  // Remove "/blog/" from the incoming slug.
  slug = slug.replace(/^\/blog\//, '')
  const data = await query(
    'posts',
    `slug=${slug}&_fields=id,date,slug,status,title,excerpt,content,acf,category_names,tag_names,featured_image_data,yoast_head_json`
  )
  return data[0]
}
