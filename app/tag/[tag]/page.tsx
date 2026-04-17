import {FilteredPostsContent} from '@/components/FilteredPostsContent/FilteredPostsContent'
import {siteConfig} from '@/lib/config'
import {getAllTags, getPostsByTag} from '@/lib/content'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'

/**
 * Props for the tag listing page and its content component.
 */
interface TagPageProps {
  /** Resolved route params containing the tag slug. */
  params: Promise<{tag: string}>
  /** Resolved search parameters, including optional page number. */
  searchParams: Promise<{page?: string}>
}

/**
 * Pre-renders a route segment for each tag.
 *
 * @returns An array of param objects, one per tag.
 */
export async function generateStaticParams() {
  return (await getAllTags()).map((tag) => ({tag: encodeURIComponent(tag)}))
}

/**
 * Generates SEO metadata for the tag listing page.
 *
 * @param props - The tag page props.
 * @returns Next.js Metadata for the tag.
 */
export async function generateMetadata({
  params
}: TagPageProps): Promise<Metadata> {
  const {tag} = await params
  const decoded = decodeURIComponent(tag)
  return {
    title: `Posts tagged "${decoded}" - ${siteConfig.name}`,
    description: `All posts tagged with "${decoded}".`,
    alternates: {canonical: `/tag/${tag}`}
  }
}

/**
 * Renders the paginated post listing for a tag.
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

  return (
    <FilteredPostsContent
      title={`Tag: ${decoded}`}
      posts={allPosts}
      page={page}
      baseUrl={`/tag/${tag}`}
    />
  )
}

/**
 * Tag page entry point. Wraps the content in a Suspense boundary.
 *
 * @param props - The tag page props.
 * @returns A React element wrapping the paginated tag post list.
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
