import {PostList} from '@/components/PostList/PostList'
import {PostPagination} from '@/components/PostPagination/PostPagination'
import {siteConfig} from '@/lib/config'
import {getAllCategories, getPostsByCategory} from '@/lib/content'
import {Title} from '@mantine/core'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'

const PAGE_SIZE = 14

/**
 * Props for the category page and its content component.
 */
interface CategoryPageProps {
  /** Resolved route params containing the URL-encoded category slug. */
  params: Promise<{category: string}>
  /** Resolved search parameters, including optional page number. */
  searchParams: Promise<{page?: string}>
}

export async function generateStaticParams() {
  return (await getAllCategories()).map((category) => ({
    category: encodeURIComponent(category)
  }))
}

export async function generateMetadata({
  params
}: CategoryPageProps): Promise<Metadata> {
  const {category} = await params
  const decoded = decodeURIComponent(category)
  return {
    title: `Posts in "${decoded}" - ${siteConfig.name}`,
    description: `All posts in the "${decoded}" category.`,
    alternates: {
      canonical: `/category/${category}`
    }
  }
}

/**
 * Renders the paginated post listing for a category archive page.
 *
 * @param props - The category page props.
 * @returns A React element with the category title, post list, and pagination.
 */
export async function CategoryPageContent({
  params,
  searchParams
}: Readonly<CategoryPageProps>) {
  const {category} = await params
  const {page} = await searchParams
  const decoded = decodeURIComponent(category)
  const allPosts = await getPostsByCategory(decoded)

  if (allPosts.length === 0) notFound()

  const currentPage = Math.max(1, Number.parseInt(page ?? '1', 10))
  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
  const start = (currentPage - 1) * PAGE_SIZE
  const posts = allPosts.slice(start, start + PAGE_SIZE)

  return (
    <>
      <Title order={1} mb="xl" ta="center">
        Category: {decoded}
      </Title>
      <PostList posts={posts} />
      <PostPagination
        total={totalPages}
        current={currentPage}
        baseUrl={`/category/${category}`}
      />
    </>
  )
}

/**
 * Category page entry point. Wraps the content in a Suspense boundary required
 * by Cache Components mode.
 *
 * @param props - The category page props.
 * @returns A React element wrapping the category post list.
 */
export default function CategoryPage({
  params,
  searchParams
}: Readonly<CategoryPageProps>) {
  return (
    <Suspense>
      <CategoryPageContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
