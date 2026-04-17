import {PostList} from '@/components/PostList/PostList'
import {PostPagination} from '@/components/PostPagination/PostPagination'
import {siteConfig} from '@/lib/config'
import {getAllTags, getPostsByTag} from '@/lib/content'
import {Title} from '@mantine/core'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'

const PAGE_SIZE = 14

/**
 * Props for the tag page and its content component.
 */
interface TagPageProps {
  /** Resolved route params containing the URL-encoded tag slug. */
  params: Promise<{tag: string}>
  /** Resolved search parameters, including optional page number. */
  searchParams: Promise<{page?: string}>
}

export async function generateStaticParams() {
  return (await getAllTags()).map((tag) => ({tag: encodeURIComponent(tag)}))
}

export async function generateMetadata({
  params
}: TagPageProps): Promise<Metadata> {
  const {tag} = await params
  const decoded = decodeURIComponent(tag)
  return {
    title: `Posts tagged "${decoded}" - ${siteConfig.name}`,
    description: `All posts tagged with "${decoded}".`,
    alternates: {
      canonical: `/tag/${tag}`
    }
  }
}

/**
 * Renders the paginated post listing for a tag archive page.
 *
 * @param props - The tag page props.
 * @returns A React element with the tag title, post list, and pagination.
 */
export async function TagPageContent({
  params,
  searchParams
}: Readonly<TagPageProps>) {
  const {tag} = await params
  const {page} = await searchParams
  const decoded = decodeURIComponent(tag)
  const allPosts = await getPostsByTag(decoded)

  if (allPosts.length === 0) notFound()

  const currentPage = Math.max(1, Number.parseInt(page ?? '1', 10))
  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
  const start = (currentPage - 1) * PAGE_SIZE
  const posts = allPosts.slice(start, start + PAGE_SIZE)

  return (
    <>
      <Title order={1} mb="xl" ta="center">
        Tag: {decoded}
      </Title>
      <PostList posts={posts} />
      <PostPagination
        total={totalPages}
        current={currentPage}
        baseUrl={`/tag/${tag}`}
      />
    </>
  )
}

/**
 * Tag page entry point. Wraps the content in a Suspense boundary required
 * by Cache Components mode.
 *
 * @param props - The tag page props.
 * @returns A React element wrapping the tag post list.
 */
export default function TagPage({
  params,
  searchParams
}: Readonly<TagPageProps>) {
  return (
    <Suspense>
      <TagPageContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
