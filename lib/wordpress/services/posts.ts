import {executeQuery} from '../client'
import {
  GET_POSTS_QUERY,
  GET_POST_BY_SLUG_QUERY,
  GET_ALL_POST_SLUGS_QUERY
} from '../queries/posts'
import type {
  GetPostsResult,
  GetPostBySlugResult,
  GetAllPostSlugsResult,
  GetPostsVariables,
  GetPostBySlugVariables
} from '../types'

/**
 * Fetch all published posts with pagination.
 * Always fetches fresh data from WordPress.
 *
 * @param first - Number of posts to fetch (default: 10)
 * @param after - Cursor for pagination
 * @returns Typed query result with posts and pagination info
 */
export async function getPosts(first = 10, after?: string) {
  const data = await executeQuery<GetPostsResult, GetPostsVariables>(
    GET_POSTS_QUERY,
    {first, after}
  )

  return data
}

/**
 * Fetch a single post by slug.
 * Always fetches fresh data from WordPress.
 *
 * @param slug - Post slug
 * @returns Typed query result with post data
 */
export async function getPostBySlug(slug: string) {
  const data = await executeQuery<GetPostBySlugResult, GetPostBySlugVariables>(
    GET_POST_BY_SLUG_QUERY,
    {slug}
  )

  return data
}

/**
 * Fetch all post slugs for static generation.
 * Always fetches fresh data from WordPress.
 *
 * @returns Array of post slugs
 */
export async function getAllPostSlugs(): Promise<string[]> {
  const data = await executeQuery<GetAllPostSlugsResult>(
    GET_ALL_POST_SLUGS_QUERY
  )

  return data.posts?.nodes?.map((node) => node.slug).filter(Boolean) ?? []
}

/**
 * Type guard to check if a post exists.
 */
export function postExists<T>(post: T | null | undefined): post is T {
  return post !== null && post !== undefined
}
