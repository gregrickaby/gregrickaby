import type { Metadata, ResolvingMetadata } from 'next'

import { PageTitle } from '@/components/page-title'
import { PostGrid } from '@/components/post-grid'
import { getAllPosts } from '@/lib/content'
import { buildPageMetadata } from '@/lib/metadata'

export function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  return buildPageMetadata(
    {
      title: 'Blog',
      description: 'Posts by Greg Rickaby about code, photography, and more.',
      path: '/blog',
    },
    parent,
  )
}

/**
 * Every card prefetches its post's prerendered HTML, so navigation is instant
 * for readers without JavaScript. That is about 400 KB today. Revisit at 40
 * posts: measure the index transfer, then decide whether prefetch should wait
 * for hover or the viewport.
 */
export default function BlogPage() {
  return (
    <>
      <PageTitle>Blog</PageTitle>
      <PostGrid posts={getAllPosts()} />
    </>
  )
}
