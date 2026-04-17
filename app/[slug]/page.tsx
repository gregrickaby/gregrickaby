import {Article} from '@/components/Article/Article'
import {PostNavigation} from '@/components/PostNavigation/PostNavigation'
import {getAllPosts, getPostBySlug} from '@/lib/content'
import {buildContentMetadata} from '@/lib/metadata'
import {buildBlogPostingGraph, serializeSchema} from '@/lib/schema'
import {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'

interface PageProps {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({slug: post.slug}))
}

export async function generateMetadata(
  {params}: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const {slug} = await params
  const post = await getPostBySlug(slug)
  return post ? buildContentMetadata(post.meta, `/${slug}`, parent) : {}
}

export default async function PostPage({params}: Readonly<PageProps>) {
  const {slug} = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // getAllPosts() returns posts sorted newest-first, so the previous post
  // (older) is at index + 1 and the next post (newer) is at index - 1.
  const allPosts = await getAllPosts()
  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const prev =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const next = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  const jsonLd = buildBlogPostingGraph(post.meta)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: serializeSchema(jsonLd)}}
      />
      <Article meta={post.meta} content={post.content} />
      <PostNavigation prev={prev} next={next} />
    </>
  )
}
