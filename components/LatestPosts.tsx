import {Post} from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

interface LatestPostsProps {
  posts: Post[]
}

/**
 * Latest posts component.
 */
export default function LatestPosts({posts}: LatestPostsProps) {
  return (
    <>
      <h2 className="font-3xl m-0">Latest Posts</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {posts.map((post: Post) => (
          <article key={post.databaseId}>
            {post.featuredImage?.node?.mediaDetails?.sizes?.[0] && (
              <Link href={`/blog/${post.slug}`}>
                <Image
                  alt={post.featuredImage.node.altText}
                  height={post.featuredImage.node.mediaDetails.sizes[0].height}
                  src={post.featuredImage.node.mediaDetails.sizes[0].sourceUrl}
                  width={post.featuredImage.node.mediaDetails.sizes[0].width}
                  priority={true}
                />
              </Link>
            )}
            <Link href={`/blog/${post.slug}`}>
              <h2 dangerouslySetInnerHTML={{__html: post.title}} />
            </Link>
            <p className="text-sm text-gray-500">
              {post.commentCount > 0 ? post.commentCount : 0} comments
            </p>
            <div dangerouslySetInnerHTML={{__html: post.excerpt}} />
            <Link className="button" href={`/blog/${post.slug}`}>
              View Post
            </Link>
          </article>
        ))}
      </div>
    </>
  )
}
