'use client'

import {Pagination} from '@mantine/core'
import {useRouter} from 'next/navigation'

/**
 * Props for the PostPagination component.
 *
 * @interface
 */
interface PostPaginationProps {
  /** Total number of posts for pagination. */
  total: number
  /** Current page number (1-based index). */
  current: number
  /** Optional. Base URL for pagination links. Defaults to '/'. */
  baseUrl?: string
}

/**
 * Pagination component for navigating through paginated post listings.
 * Uses URL query parameters to control the current page.
 *
 * @param props - The props for the PostPagination component.
 * @returns A React element with the pagination controls, or null if only 1 page.
 */
export function PostPagination({
  total,
  current,
  baseUrl = '/'
}: Readonly<PostPaginationProps>) {
  const router = useRouter()

  if (total <= 1) return null

  const separator = baseUrl.includes('?') ? '&' : '?'

  return (
    <Pagination
      mt="xl"
      total={total}
      value={current}
      onChange={(page) => router.push(`${baseUrl}${separator}page=${page}`)}
    />
  )
}
