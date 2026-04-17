import {PostList} from '@/components/PostList/PostList'
import {PostPagination} from '@/components/PostPagination/PostPagination'
import {paginate, parsePage} from '@/lib/pagination'
import type {PostMeta} from '@/lib/types'
import {Title} from '@mantine/core'

/**
 * Props for the FilteredPostsContent component.
 */
interface FilteredPostsContentProps {
  /** Page heading (e.g. "Category: Code" or "Tag: photography"). */
  title: string
  /** Filtered list of posts to display. */
  posts: PostMeta[]
  /** Raw page query string from searchParams (may be undefined). */
  page: string | undefined
  /** Base URL used by PostPagination to build page links (e.g. "/category/code"). */
  baseUrl: string
}

/**
 * Shared layout for taxonomy (category and tag) listing pages.
 *
 * Accepts a pre-filtered list of posts, paginates them, and renders a heading,
 * post grid, and pagination controls.
 *
 * @param props - The props for the FilteredPostsContent component.
 * @returns A React element containing the title, post list, and pagination.
 */
export function FilteredPostsContent({
  title,
  posts,
  page,
  baseUrl
}: Readonly<FilteredPostsContentProps>) {
  const {items, currentPage, totalPages} = paginate(posts, parsePage(page))
  return (
    <>
      <Title order={1} mb="xl" ta="center">
        {title}
      </Title>
      <PostList posts={items} />
      <PostPagination
        total={totalPages}
        current={currentPage}
        baseUrl={baseUrl}
      />
    </>
  )
}
