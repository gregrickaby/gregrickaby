import {GitHubRepo, Post, QueryParams} from '@/lib/types'

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
    query: '&_fields=id,slug,title,featured_image_data,yoast_head_json',
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

/**
 * Get most starred GitHub repos.
 *
 * @see https://docs.github.com/en/rest/reference/repos#list-repositories-for-a-user
 */
export async function getPopularGithubRepos(
  limit: number
): Promise<GitHubRepo[]> {
  try {
    // Fetch 100 repos from the GitHub API.
    const response = await fetch(
      `https://api.github.com/users/gregrickaby/repos?per_page=100`
    )

    // If the response status is not 200, throw an error.
    if (!response.ok) {
      console.error('Response Status:', response.status)
      throw new Error(response.statusText)
    }

    // Read the response as JSON.
    const repos = await response.json()

    // Verify data has repos.
    if (!repos || repos.length === 0) {
      throw new Error('No repos found.')
    }

    // Sort repositories by stargazers_count in descending order.
    const sortedRepos = repos.sort(
      (a: GitHubRepo, b: GitHubRepo) => b.stargazers_count - a.stargazers_count
    )

    // Return the top N repos.
    return sortedRepos.slice(0, limit)
  } catch (error) {
    console.error(error)
    throw error
  }
}
