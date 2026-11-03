import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import { PageTitle } from '@/components/page-title'
import { PostGrid } from '@/components/post-grid'
import { getAllTags, getPostsByTag } from '@/lib/content'
import { buildPageMetadata } from '@/lib/metadata'

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: encodeURIComponent(tag) }))
}

export async function generateMetadata(
  { params }: PageProps<'/tag/[tag]'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const name = decodeURIComponent((await params).tag)
  const count = getPostsByTag(name).length
  return buildPageMetadata(
    {
      title: `Posts tagged "${name}"`,
      description: `${count} ${count === 1 ? 'post' : 'posts'} by Greg Rickaby tagged "${name}", newest first.`,
      path: `/tag/${encodeURIComponent(name)}`,
    },
    parent,
  )
}

/* Blocks on params so the list is in the prerendered HTML; see app/(site)/[slug]/page.tsx. */
export const instant = false

export default async function TagPage({ params }: PageProps<'/tag/[tag]'>) {
  const name = decodeURIComponent((await params).tag)
  const posts = getPostsByTag(name)
  if (posts.length === 0) notFound()

  return (
    <>
      <PageTitle>Tag: {name}</PageTitle>
      <PostGrid posts={posts} />
    </>
  )
}
