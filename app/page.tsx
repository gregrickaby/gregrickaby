import {PostList} from '@/components/PostList/PostList'
import {PostPagination} from '@/components/PostPagination/PostPagination'
import {siteConfig} from '@/lib/config'
import {getAllPosts} from '@/lib/content'
import {paginate, parsePage} from '@/lib/pagination'
import {Suspense} from 'react'

export const metadata = {
  title: `${siteConfig.name} - My Blog`,
  description: siteConfig.description,
  alternates: {
    canonical: '/'
  }
}

/**
 * Props for the home page and its content component.
 */
interface HomePageProps {
  /** Resolved search parameters, including optional page number. */
  searchParams: Promise<{page?: string}>
}

/**
 * Renders the paginated post listing for the home page.
 *
 * @param props - The home page props.
 * @returns A React element with the post list and pagination controls.
 */
export async function HomePageContent({searchParams}: Readonly<HomePageProps>) {
  const [{page}, allPosts] = await Promise.all([searchParams, getAllPosts()])
  const {
    items: posts,
    currentPage,
    totalPages
  } = paginate(allPosts, parsePage(page))

  const nextUrl =
    currentPage < totalPages
      ? `${siteConfig.url}?page=${currentPage + 1}`
      : undefined
  let prevUrl: string | undefined
  if (currentPage > 1) {
    prevUrl =
      currentPage === 2
        ? siteConfig.url
        : `${siteConfig.url}?page=${currentPage - 1}`
  }

  return (
    <>
      {nextUrl ? <link rel="next" href={nextUrl} /> : null}
      {prevUrl ? <link rel="prev" href={prevUrl} /> : null}
      <PostList posts={posts} />
      <PostPagination total={totalPages} current={currentPage} />
    </>
  )
}

/**
 * Home page entry point. Wraps the content in a Suspense boundary required
 * by Cache Components mode.
 *
 * @param props - The home page props.
 * @returns A React element wrapping the paginated post list.
 */
export default function HomePage({searchParams}: Readonly<HomePageProps>) {
  return (
    <Suspense>
      <HomePageContent searchParams={searchParams} />
    </Suspense>
  )
}
