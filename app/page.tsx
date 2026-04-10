import {PostList} from '@/components/PostList/PostList'
import {PostPagination} from '@/components/PostPagination/PostPagination'
import {siteConfig} from '@/lib/config'
import {getAllPosts} from '@/lib/content'

const PAGE_SIZE = 14

export const metadata = {
  title: `${siteConfig.name} - My Blog`,
  description: siteConfig.description
}

interface HomePageProps {
  searchParams: Promise<{page?: string}>
}

export default async function HomePage({
  searchParams
}: Readonly<HomePageProps>) {
  const {page} = await searchParams
  const currentPage = Math.max(1, Number.parseInt(page ?? '1', 10))
  const allPosts = getAllPosts()
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
