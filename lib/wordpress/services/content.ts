import {getPostBySlug} from './posts'
import {getPageBySlug} from './pages'
import type {Post, Page} from '../types'

/**
 * Content type discriminator.
 */
export type ContentType = 'post' | 'page' | null

/**
 * Result of fetching content by slug.
 */
export interface ContentResult {
  type: ContentType
  data: Post | Page | null
}

/**
 * Fetch content (post or page) by slug.
 * Tries to fetch as a post first, then as a page.
 *
 * @param slug - Content slug
 * @returns Content result with type and data
 */
export async function getContentBySlug(slug: string): Promise<ContentResult> {
  // Try to fetch as a post first
  const postData = await getPostBySlug(slug)
  if (postData.post) {
    return {
      type: 'post',
      data: postData.post
    }
  }

  // If not a post, try to fetch as a page
  const pageData = await getPageBySlug(slug)
  if (pageData.page) {
    return {
      type: 'page',
      data: pageData.page
    }
  }

  // Content not found
  return {
    type: null,
    data: null
  }
}

/**
 * Type guard to check if content is a post.
 * Note: Also exported from types module as a general utility.
 */
export function isPostContent(content: Post | Page | null): content is Post {
  if (!content) return false
  // Posts have categories, pages don't
  return 'categories' in content && !('parent' in content)
}

/**
 * Type guard to check if content is a page.
 */
export function isPageContent(content: Post | Page | null): content is Page {
  if (!content) return false
  // Pages don't have categories, posts do
  return !('categories' in content)
}
