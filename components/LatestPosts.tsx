import {Post} from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

interface LatestPostsProps {
  posts: Post[]
  title?: string
}

/**
 * Latest posts component.
 */
export default function LatestPosts({posts, title}: LatestPostsProps) {
  const componentTitle = title || 'Latest Posts'
  return (
    <>
      <h3>{componentTitle}</h3>
      <div className="grid gap-8 md:grid-cols-3">
        {posts.map((post: Post) => (
          <article className="not-prose" key={post.databaseId}>
            {post.featuredImage?.node && (
              <Link href={`/blog/${post.slug}`}>
                <Image
                  alt={post.featuredImage.node.altText}
                  height={post.featuredImage.node.mediaDetails.height}
                  src={post.featuredImage.node.sourceUrl}
                  width={post.featuredImage.node.mediaDetails.width}
                  priority={true}
                />
              </Link>
            )}
            <Link
              className="no-underline hover:underline"
              href={`/blog/${post.slug}`}
            >
              <h2
                className="mt-1 text-xl font-bold leading-tight"
                dangerouslySetInnerHTML={{__html: post.title}}
              />
            </Link>
          </article>
        ))}
      </div>
    </>
  )
}
