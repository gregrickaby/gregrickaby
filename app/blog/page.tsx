import config from '@/lib/config'
import getAllPosts from '@/lib/queries/getAllPosts'
import {Post} from '@/lib/types'
import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const dynamic = 'force-dynamic'
export const revalidate = 3600

/**
 * Setup metadata.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#basic-fields
 */
export const metadata: Metadata = {
  title: `${config.siteName} - Blog Archive`,
  description: 'The latest posts from the blog.'
}

/**
 * The blog archive route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Archive() {
  // Fetch posts from WordPress.
  const posts = await getAllPosts()

  // No data? Bail...
  if (!posts || !posts.length) {
    notFound()
  }

  return (
    <main className="container m-auto flex flex-col gap-8">
      <aside>
        <h2>Latest Posts</h2>
        <div className="flex flex-wrap gap-8">
          {posts.map((post: Post) => (
            <article className="w-72" key={post.databaseId}>
              <Image
                alt={post?.featuredImage?.node?.altText}
                height={
                  post?.featuredImage?.node?.mediaDetails?.sizes[0]?.height
                }
                src={
                  post?.featuredImage?.node?.mediaDetails?.sizes[0]?.sourceUrl
                }
                width={post?.featuredImage?.node?.mediaDetails?.sizes[0]?.width}
                priority={true}
              />
              <Link href={`/blog/${post.slug}`}>
                <h2 dangerouslySetInnerHTML={{__html: post.title}} />
              </Link>
              <p className="text-sm text-gray-500">
                {post.commentCount} Comments
              </p>
              <div dangerouslySetInnerHTML={{__html: post.excerpt}} />
              <Link className="button" href={`/blog/${post.slug}`}>
                View Post
              </Link>
            </article>
          ))}
        </div>
      </aside>
    </main>
  )
}
