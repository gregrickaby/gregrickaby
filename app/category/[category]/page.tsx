import {FilteredPostsContent} from '@/components/FilteredPostsContent/FilteredPostsContent'
import {siteConfig} from '@/lib/config'
import {getAllCategories, getPostsByCategory} from '@/lib/content'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'

/**
 * Props for the category listing page and its content component.
 */
interface CategoryPageProps {
  /** Resolved route params containing the category slug. */
  params: Promise<{category: string}>
  /** Resolved search parameters, including optional page number. */
  searchParams: Promise<{page?: string}>
}

/**
 * Pre-renders a route segment for each category.
 *
 * @returns An array of param objects, one per category.
 */
export async function generateStaticParams() {
  return (await getAllCategories()).map((category) => ({
    category: encodeURIComponent(category)
  }))
}

/**
 * Generates SEO metadata for the category listing page.
 *
 * @param props - The category page props.
 * @returns Next.js Metadata for the category.
 */
export async function generateMetadata({
  params
}: CategoryPageProps): Promise<Metadata> {
  const {category} = await params
  const decoded = decodeURIComponent(category)
  return {
    title: `Posts in "${decoded}" - ${siteConfig.name}`,
    description: `All posts in the "${decoded}" category.`,
    alternates: {canonical: `/category/${category}`}
  }
}

/**
 * Renders the paginated post listing for a category.
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

  return (
    <FilteredPostsContent
      title={`Category: ${decoded}`}
      posts={allPosts}
      page={page}
      baseUrl={`/category/${category}`}
    />
  )
}

/**
 * Category page entry point. Wraps the content in a Suspense boundary.
 *
 * @param props - The category page props.
 * @returns A React element wrapping the paginated category post list.
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
