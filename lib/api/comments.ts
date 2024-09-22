'use server'

import {Comment} from '@/lib/types'

interface CreateCommentParams {
  authorEmail: string
  authorName: string
  authorUrl?: string
  comment: string
  postId: number
}

interface CreateCommentResponse {
  code: number
  comment: Comment
  data: {
    status: number
  }
  message: string
}

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
    const url = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/comments`)

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

/**
 * Creates a new comment on a WordPress post.
 *
 * @param postId - The ID of the post to comment on.
 * @param comment - The comment.
 * @param authorName - The name of the comment's author.
 * @param authorEmail - The email of the author.
 * @param authorUrl - The URL of the author's website.
 * @returns A promise that resolves to the created comment.
 */
export async function createComment({
  authorEmail,
  authorName,
  authorUrl,
  comment,
  postId
}: CreateCommentParams): Promise<string> {
  try {
    // Validate input
    if (!postId || !authorEmail || !authorName || !comment) {
      throw new Error('Missing required parameters')
    }

    // Build the URL
    const url = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/comments`)

    // Send the request to create the comment
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WORDPRESS_JWT_TOKEN}`
      },
      body: JSON.stringify({
        ...(authorUrl ? {author_url: authorUrl} : {}),
        author_email: authorEmail,
        author_name: authorName,
        content: comment,
        post: postId
      })
    })

    // Handle different response statuses.
    if (response.status === 400) {
      return 'Bad request. Please ensure all required fields are filled out correctly.'
    }

    if (response.status === 401) {
      return 'Unauthorized. Please log in and try again.'
    }

    if (response.status === 409) {
      return 'Duplicate comment detected. Please avoid submitting the same comment multiple times.'
    }

    // Parse the response body
    const data: Comment = await response.json()

    // No comment status? Throw an error.
    if (!data?.status) {
      throw new Error('Failed to create comment. Please try again.')
    }

    // Return a message based on the comment status.
    switch (data.status) {
      case 'spam':
        return 'Your comment has been marked as spam and is awaiting moderation.'
      case 'approved':
        return 'Your comment has been successfully submitted and is now live. Thank you!'
      default:
        return 'Your comment has been submitted and is awaiting moderation. Thank you!'
    }
  } catch (error) {
    console.error(`Exception thrown in createComment(): ${error}`)
    throw error
  }
}
