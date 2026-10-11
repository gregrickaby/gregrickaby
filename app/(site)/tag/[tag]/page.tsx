import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageTitle } from '@/components/page-title'
import { PostGrid } from '@/components/post-grid'
import { getAllTags, getPostsByTag } from '@/lib/content'

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: encodeURIComponent(tag) }))
}

export async function generateMetadata({ params }: PageProps<'/tag/[tag]'>): Promise<Metadata> {
  const name = decodeURIComponent((await params).tag)
  return {
    title: `Posts tagged "${name}"`,
    description: `All posts tagged with "${name}".`,
    alternates: { canonical: `/tag/${encodeURIComponent(name)}` },
  }
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
