import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import { Article } from '@/components/article'
import { JsonLd } from '@/components/json-ld'
import { PostNav } from '@/components/post-nav'
import { getAdjacentPosts, getAllPosts, getPost } from '@/lib/content'
import { buildContentMetadata } from '@/lib/metadata'
import { buildBlogPostingGraph } from '@/lib/schema'

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata(
  { params }: PageProps<'/[slug]'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  return post ? buildContentMetadata(post.meta, `/${slug}`, parent) : {}
}

/*
 * Blocking on params keeps the whole post in the prerendered HTML, which
 * readers without JavaScript and crawlers need. Post links use
 * `prefetch={true}`, which loads the prerendered page before the click, so
 * navigations still render at once.
 */
export const instant = false

export default async function PostPage({ params }: PageProps<'/[slug]'>) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const { older, newer } = getAdjacentPosts(slug)

  return (
    <>
      <JsonLd graph={buildBlogPostingGraph(post.meta)} />
      <Article post={post} />
      <PostNav newer={newer} older={older} />
    </>
  )
}
