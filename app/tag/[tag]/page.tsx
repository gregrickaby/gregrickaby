import {PostList} from '@/components/PostList/PostList'
import {PostPagination} from '@/components/PostPagination/PostPagination'
import {siteConfig} from '@/lib/config'
import {getAllTags, getPostsByTag} from '@/lib/content'
import {Title} from '@mantine/core'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

const PAGE_SIZE = 14

interface TagPageProps {
  params: Promise<{tag: string}>
  searchParams: Promise<{page?: string}>
}

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({tag: encodeURIComponent(tag)}))
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

export default async function TagPage({
  params,
  searchParams
}: Readonly<TagPageProps>) {
  const {tag} = await params
  const {page} = await searchParams
  const decoded = decodeURIComponent(tag)
  const allPosts = getPostsByTag(decoded)

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
