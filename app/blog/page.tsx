import {FromArchives} from '@/components/FromArchives/FromArchives'
import {PostList} from '@/components/PostList/PostList'
import {PostPagination} from '@/components/PostPagination/PostPagination'
import {siteConfig} from '@/lib/config'
import {getAllPosts, getArchivePosts} from '@/lib/content'
import {buildRelLinks, paginate, parsePage} from '@/lib/pagination'
import {Skeleton} from '@mantine/core'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'

/**
 * Generates SEO metadata for the blog listing page.
 *
 * @returns Next.js Metadata for the blog listing page.
 */
export function generateMetadata(): Metadata {
  return {
    title: `${siteConfig.name} - Blog`,
    description: siteConfig.description,
    alternates: {
      canonical: '/blog'
    }
  }
}

/**
 * Props for the blog page and its content component.
 */
interface BlogPageProps {
  /** Resolved search parameters, including optional page number. */
  searchParams: Promise<{page?: string}>
}

/**
 * Renders the "From The Archives" section and paginated post listing for
 * the blog page.
 *
 * @param props - The blog page props.
 * @returns A React element with the archives section, post list, and pagination controls.
 */
export async function BlogPageContent({searchParams}: Readonly<BlogPageProps>) {
  const [{page}, allPosts, archivePosts] = await Promise.all([
    searchParams,
    getAllPosts(),
    getArchivePosts()
  ])
  const {
    items: posts,
    currentPage,
    totalPages
  } = paginate(allPosts, parsePage(page))

  if (currentPage > totalPages) notFound()

  const {nextUrl, prevUrl} = buildRelLinks(
    `${siteConfig.url}/blog`,
    currentPage,
    totalPages
  )

  return (
    <>
      {nextUrl ? <link rel="next" href={nextUrl} /> : null}
      {prevUrl ? <link rel="prev" href={prevUrl} /> : null}
      {currentPage === 1 ? <FromArchives posts={archivePosts} /> : null}
      <PostList posts={posts} />
      <PostPagination
        total={totalPages}
        current={currentPage}
        baseUrl="/blog"
      />
    </>
  )
}

/**
 * Blog page entry point. Wraps the content in a Suspense boundary required
 * by Cache Components mode.
 *
 * @param props - The blog page props.
 * @returns A React element wrapping the archives section and paginated post list.
 */
export default function BlogPage({searchParams}: Readonly<BlogPageProps>) {
  return (
    <Suspense fallback={<Skeleton height={800} />}>
      <BlogPageContent searchParams={searchParams} />
    </Suspense>
  )
}
