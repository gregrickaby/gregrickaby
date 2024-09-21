import {Comment} from '@/lib/types'

/**
 * Fetches all comments for a given post in batches.
 *
 * @see https://developer.wordpress.org/rest-api/reference/comments/
 *
 * @param postId The ID of the post to fetch comments for.
 * @returns A promise that resolves to an array of comments.
 */
export async function fetchComments(postId: number): Promise<Comment[]> {
  try {
    // If no post ID is provided, throw an error.
    if (!postId) {
      throw new Error('No post ID provided')
    }

    // Build the URL
    const url = new URL(`${process.env.WORDPRESS_API_URL}/comments`)

    // Build the query parameters.
    url.searchParams.append('post', postId.toString())
    url.searchParams.append('order', 'asc')
    url.searchParams.append('orderby', 'date')
    url.searchParams.append('page', '1')
    url.searchParams.append('per_page', '100')
    url.searchParams.append('status', 'approve')

    // Fetch the comments.
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      next: {
        tags: [`comments-${postId}`],
        revalidate: 86400 // 24 hours.
      }
    })

    // Bad response? Throw an error.
    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }

    // Parse the response.
    const comments: Comment[] = await response.json()

    // If the response is not an array, throw an error.
    if (!Array.isArray(comments)) {
      throw new Error('Unexpected response format for comments')
    }

    // Return the comments.
    return comments
  } catch (error) {
    console.error(`Exception thrown in fetchComments(): ${error}`)
    throw error
  }
}
