import {Article} from '@/components/Article/Article'
import {PostNavigation} from '@/components/PostNavigation/PostNavigation'
import {getAllPosts, getPostBySlug, getAdjacentPosts} from '@/lib/content'
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

  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getAllPosts()
  ])

  if (!post) {
    notFound()
  }

  const {prev, next} = getAdjacentPosts(allPosts, slug)

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
