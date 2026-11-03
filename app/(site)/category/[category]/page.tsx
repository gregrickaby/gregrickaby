import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import { PageTitle } from '@/components/page-title'
import { PostGrid } from '@/components/post-grid'
import { getAllCategories, getPostsByCategory } from '@/lib/content'
import { buildPageMetadata } from '@/lib/metadata'

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category: encodeURIComponent(category) }))
}

export async function generateMetadata(
  { params }: PageProps<'/category/[category]'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const name = decodeURIComponent((await params).category)
  const count = getPostsByCategory(name).length
  return buildPageMetadata(
    {
      title: `Posts in "${name}"`,
      description: `${count} ${count === 1 ? 'post' : 'posts'} by Greg Rickaby in the "${name}" category, newest first.`,
      path: `/category/${encodeURIComponent(name)}`,
    },
    parent,
  )
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
