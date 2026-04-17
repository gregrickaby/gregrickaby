import {PostList} from '@/components/PostList/PostList'
import {PostPagination} from '@/components/PostPagination/PostPagination'
import {siteConfig} from '@/lib/config'
import {getAllPosts} from '@/lib/content'
import {Suspense} from 'react'

const PAGE_SIZE = 14

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
  const {page} = await searchParams
  const currentPage = Math.max(1, Number.parseInt(page ?? '1', 10))
  const allPosts = await getAllPosts()
  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
  const start = (currentPage - 1) * PAGE_SIZE
  const posts = allPosts.slice(start, start + PAGE_SIZE)

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
      {nextUrl && <link rel="next" href={nextUrl} />}
      {prevUrl && <link rel="prev" href={prevUrl} />}
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
