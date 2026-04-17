import {Article} from '@/components/Article/Article'
import {PostNavigation} from '@/components/PostNavigation/PostNavigation'
import {siteConfig} from '@/lib/config'
import {getAllPosts, getPostBySlug} from '@/lib/content'
import {buildBlogPostingGraph, serializeSchema} from '@/lib/schema'
import {getFeaturedImagePath} from '@/lib/utils'
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
  if (!post) return {}

  const featuredImage = getFeaturedImagePath(post.meta)
  const previousImages = (await parent).openGraph?.images ?? []

  return {
    title: post.meta.title,
    description: post.meta.description,
    alternates: {
      canonical: `/${slug}`
    },
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: 'article',
      publishedTime: post.meta.date,
      modifiedTime: post.meta.modified,
      url: `${siteConfig.url}/${post.meta.slug}`,
      images: [
        ...(featuredImage ? [{url: `${siteConfig.url}${featuredImage}`}] : []),
        ...previousImages
      ]
    }
  }
}

export default async function PostPage({params}: Readonly<PageProps>) {
  const {slug} = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

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
