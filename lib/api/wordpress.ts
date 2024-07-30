import {Post, QueryParams} from '@/lib/types'

/**
 * Generic function to query data from the WordPress REST API.
 */
async function query({
  endpoint,
  query,
  posts_per_page
}: QueryParams): Promise<Post[]> {
  try {
    const response = await fetch(
      'https://blog.gregrickaby.com/wp-json/wp/v2/' +
        endpoint +
        '?' +
        query +
        (posts_per_page ? '&per_page=' + posts_per_page : ''),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
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
export async function getPages(posts_per_page: number): Promise<Post[]> {
  return await query({
    endpoint: 'pages',
    query: '&_fields=id,slug,title,yoast_head_json',
    posts_per_page
  })
}

/**
 * Get all posts.
 */
export async function getPosts(posts_per_page: number): Promise<Post[]> {
  return await query({
    endpoint: 'posts',
    query:
      '&_fields=id,date,slug,title,excerpt,author_name,author_gravatar_url,category_names,featured_image_data,yoast_head_json',
    posts_per_page
  })
}

/**
 * Get a page by slug.
 */
export async function getPageBySlug(slug: string): Promise<Post> {
  const data = await query({
    endpoint: 'pages',
    query: `slug=${slug}&_fields=id,date,slug,status,title,excerpt,content,acf,category_names,tag_names,featured_image_data,yoast_head_json`
  })
  return data[0]
}

/**
 * Get a post by slug.
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  // Remove "/blog/" from the incoming slug.
  slug = slug.replace(/^\/blog\//, '')
  const data = await query({
    endpoint: 'posts',
    query: `slug=${slug}&_fields=id,date,slug,status,title,excerpt,content,acf,category_names,tag_names,featured_image_data,yoast_head_json`
  })
  return data[0]
}
