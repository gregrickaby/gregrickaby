import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageTitle } from '@/components/page-title'
import { PostGrid } from '@/components/post-grid'
import { getAllCategories, getPostsByCategory } from '@/lib/content'

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category: encodeURIComponent(category) }))
}

export async function generateMetadata({
  params,
}: PageProps<'/category/[category]'>): Promise<Metadata> {
  const name = decodeURIComponent((await params).category)
  return {
    title: `Posts in "${name}"`,
    description: `All posts in the "${name}" category.`,
    alternates: { canonical: `/category/${encodeURIComponent(name)}` },
  }
}

/* Blocks on params so the list is in the prerendered HTML; see app/(site)/[slug]/page.tsx. */
export const instant = false

export default async function CategoryPage({ params }: PageProps<'/category/[category]'>) {
  const name = decodeURIComponent((await params).category)
  const posts = getPostsByCategory(name)
  if (posts.length === 0) notFound()

  return (
    <>
      <PageTitle>Category: {name}</PageTitle>
      <PostGrid posts={posts} />
    </>
  )
}
