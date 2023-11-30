import CommentForm from '@/components/CommentForm'
import config from '@/lib/config'
import getPostBySlug from '@/lib/queries/getPostBySlug'
import getPosts from '@/lib/queries/getPosts'
import {Post} from '@/lib/types'
import {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const dynamicParams = true
export const dynamic = 'force-dynamic'
export const revalidate = 3600

/**
 * Generate the static routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Get blog posts.
  const posts = await getPosts()

  // No posts? Bail...
  if (!posts) {
    return []
  }

  // Return the slugs for each post.
  return posts.map((post: {slug: string}) => ({
    slug: post.slug
  }))
}

/**
 * Generate the metadata for each static route at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({
  params
}: {
  params: {slug: string}
}): Promise<Metadata | null> {
  // Get the blog post.
  const post = await getPostBySlug(params.slug)

  // No post? Bail...
  if (!post) {
    return {}
  }

  return {
    title: `${post.title} - ${config.siteName}`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} - ${config.siteName}`,
      description: post.excerpt,
      url: `${config.siteUrl}/blog/${params.slug}`,
      siteName: config.siteName,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: post?.featuredImage?.node?.mediaDetails?.sizes[0]?.sourceUrl,
          width: post?.featuredImage?.node?.mediaDetails?.sizes[0]?.width,
          height: post?.featuredImage?.node?.mediaDetails?.sizes[0]?.height,
          alt: post.title
        }
      ]
    }
  }
}

/**
 * The blog post route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Post({params}: {params: {slug: string}}) {
  // Fetch a single post from WordPress.
  const post = await getPostBySlug(params.slug)

  // Get blog posts.
  const posts = await getPosts(2)

  // No post? Bail...
  if (!post) {
    notFound()
  }

  return (
    <article className="container m-auto max-w-3xl space-y-8">
      <header>
        <h1
          className="m-0 p-0 text-2xl font-bold leading-none"
          dangerouslySetInnerHTML={{__html: post.title}}
        />
        <p className="mt-4 italic">
          By {post.author.node.name} on <time>{post.date}</time>
        </p>
      </header>
      <div
        className="space-y-8 text-lg"
        dangerouslySetInnerHTML={{__html: post.content}}
      />
      <footer className="flex items-center justify-between gap-4 pb-4">
        <div>
          <h3>Categories</h3>
          <ul className="m-0 flex list-none gap-2 p-0">
            {post.categories.nodes.map((category) => (
              <li className="m-0 p-0" key={category.databaseId}>
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Tags</h3>
          <ul className="m-0 flex list-none gap-2 p-0">
            {post.tags.nodes.map((tag) => (
              <li className="m-0 p-0" key={tag.databaseId}>
                {tag.name}
              </li>
            ))}
          </ul>
        </div>
      </footer>
      <section className="border-t-2 pt-4">
        <h3 className="text-xl font-bold">Comments</h3>
        {post.comments.nodes.map((comment) => (
          <article key={comment.databaseId}>
            <header className="flex items-center gap-2">
              <Image
                alt={comment.author.node.name}
                className="m-0 rounded-full"
                height={64}
                src={comment.author.node.gravatarUrl}
                width={64}
              />
              <div className="flex flex-col gap-2">
                <h4
                  className="m-0 p-0 leading-none"
                  dangerouslySetInnerHTML={{__html: comment.author.node.name}}
                />
                <time className="italic">{comment.date}</time>
              </div>
            </header>

            <div dangerouslySetInnerHTML={{__html: comment.content}} />
          </article>
        ))}
      </section>
      <CommentForm postID={post.databaseId} />
      <aside>
        <h2>Recent Posts</h2>
        <div className="flex flex-wrap gap-8">
          {posts.map((post: Post) => (
            <article className="w-72" key={post.databaseId}>
              {post.featuredImage?.node?.mediaDetails?.sizes?.[0] && (
                <Link href={`/blog/${post.slug}`}>
                  <Image
                    alt={post.featuredImage.node.altText}
                    height={
                      post.featuredImage.node.mediaDetails.sizes[0].height
                    }
                    src={
                      post.featuredImage.node.mediaDetails.sizes[0].sourceUrl
                    }
                    width={post.featuredImage.node.mediaDetails.sizes[0].width}
                    priority={true}
                  />
                </Link>
              )}
              <Link href={`/blog/${post.slug}`}>
                <h2 dangerouslySetInnerHTML={{__html: post.title}} />
              </Link>
            </article>
          ))}
        </div>
      </aside>
    </article>
  )
}
