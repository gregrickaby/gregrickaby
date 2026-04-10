import {PostList} from '@/components/PostList/PostList'
import {PostPagination} from '@/components/PostPagination/PostPagination'
import {siteConfig} from '@/lib/config'
import {getAllCategories, getPostsByCategory} from '@/lib/content'
import {Title} from '@mantine/core'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

const PAGE_SIZE = 14

interface CategoryPageProps {
  params: Promise<{category: string}>
  searchParams: Promise<{page?: string}>
}

export async function generateStaticParams() {
  return getAllCategories().map((category) => ({
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
    description: `All posts in the "${decoded}" category.`
  }
}

export default async function CategoryPage({
  params,
  searchParams
}: Readonly<CategoryPageProps>) {
  const {category} = await params
  const {page} = await searchParams
  const decoded = decodeURIComponent(category)
  const allPosts = getPostsByCategory(decoded)

  if (allPosts.length === 0) notFound()

  const currentPage = Math.max(1, Number.parseInt(page ?? '1', 10))
  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
  const start = (currentPage - 1) * PAGE_SIZE
  const posts = allPosts.slice(start, start + PAGE_SIZE)

  return (
    <>
      <Title order={1} mb="xl">
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
