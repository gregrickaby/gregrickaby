import type { Metadata } from 'next'
import { PageTitle } from '@/components/page-title'
import { PostGrid } from '@/components/post-grid'
import { getAllPosts } from '@/lib/content'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Blog',
  description: SITE.description,
  alternates: { canonical: '/blog' },
}

export default function BlogPage() {
  return (
    <>
      <PageTitle>Blog</PageTitle>
      <PostGrid posts={getAllPosts()} />
    </>
  )
}
