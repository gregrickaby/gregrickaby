import {Article} from '@/components/Article/Article'
import {JsonLd} from '@/components/JsonLd/JsonLd'
import {PostNavigation} from '@/components/PostNavigation/PostNavigation'
import {getAllPosts, getPostBySlug, getAdjacentPosts} from '@/lib/content'
import {buildContentMetadata} from '@/lib/metadata'
import {buildBlogPostingGraph} from '@/lib/schema'
import {Skeleton} from '@mantine/core'
import {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'

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

/**
 * Async sub-component that resolves the post for the given slug and renders
 * the article body and prev/next navigation. Exported for direct testing of
 * post content without a Suspense boundary. Isolated so the parent page can
 * stream it in behind a Suspense boundary.
 *
 * @param props - The params promise for the requested post.
 * @returns A React element with the post article and navigation.
 */
export async function PostContent({params}: Readonly<PageProps>) {
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
      <JsonLd graph={jsonLd} />
      <Article meta={post.meta} content={post.content} />
      <PostNavigation prev={prev} next={next} />
    </>
  )
}

/**
 * The /[slug] post page. Resolves the post matching the requested slug and
 * streams the article in behind a Suspense boundary, so the page shell
 * commits immediately for slugs outside the statically-generated set.
 *
 * @param props - The page props containing the params promise.
 * @returns A React element with the post page.
 */
export default function PostPage({params}: Readonly<PageProps>) {
  return (
    <Suspense
      fallback={
        <Skeleton
          data-testid="post-skeleton"
          height={600}
          maw={680}
          mx="auto"
        />
      }
    >
      <PostContent params={params} />
    </Suspense>
  )
}
