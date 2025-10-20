import {executeQuery} from '../client'
import {
  GET_PAGE_BY_SLUG_QUERY,
  GET_ALL_PAGE_SLUGS_QUERY
} from '../queries/pages'
import type {Page} from '../types'

/**
 * Query result for single page.
 */
export interface GetPageBySlugResult {
  page: Page | null
}

/**
 * Query result for all page slugs.
 */
export interface GetAllPageSlugsResult {
  pages: {
    nodes: Array<{slug: string}>
  } | null
}

/**
 * Query variables for fetching a single page.
 */
export interface GetPageBySlugVariables {
  slug: string
}

/**
 * Fetch a single page by slug.
 * Always fetches fresh data from WordPress.
 *
 * @param slug - Page slug (will be converted to URI format with leading slash)
 * @returns Typed query result with page data
 */
export async function getPageBySlug(slug: string) {
  // WordPress pages use URI idType, which requires a leading slash
  const uri = slug.startsWith('/') ? slug : `/${slug}`

  const data = await executeQuery<GetPageBySlugResult, GetPageBySlugVariables>(
    GET_PAGE_BY_SLUG_QUERY,
    {slug: uri}
  )

  return data
}

/**
 * Fetch all page slugs for static generation.
 * Always fetches fresh data from WordPress.
 *
 * @returns Array of page slugs
 */
export async function getAllPageSlugs(): Promise<string[]> {
  const data = await executeQuery<GetAllPageSlugsResult>(
    GET_ALL_PAGE_SLUGS_QUERY
  )

  return data.pages?.nodes?.map((node) => node.slug).filter(Boolean) ?? []
}
