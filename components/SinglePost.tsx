import Blocks from '@/components/Blocks'
import Comments from '@/components/Comments'
import FeaturedImage from '@/components/FeaturedImage'
import {formatDate} from '@/lib/functions'
import {Post} from '@/lib/types'
import Link from 'next/link'

/**
 * Single post component.
 */
export default function SinglePost({post}: {post: Post}) {
  return (
    <article>
      <header>
        <h1
          className="m-0 p-0 leading-none"
          dangerouslySetInnerHTML={{__html: post.title}}
        />
        <p className="mt-4 text-lg italic text-zinc-500 ">
          Posted on <time dateTime={post.date}>{formatDate(post.date)}</time> |{' '}
          <span>{post.seo.readingTime} minute read</span>
        </p>
        <FeaturedImage
          image={post.featuredImage}
          hidden={post.hideFeaturedImage.hideFeaturedImage}
        />
      </header>
      <Blocks content={post.content} />
      <footer className="flex items-center justify-between gap-4 pb-4">
        <div>
          <h3>Categories</h3>
          <ul className="m-0 flex list-none gap-2 p-0">
            {post.categories.nodes.map((category) => (
              <li className="m-0 p-0" key={category.databaseId}>
                <Link href={`/blog/category/${category.slug}`}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Tags</h3>
          <ul className="m-0 flex list-none gap-2 p-0">
            {post.tags.nodes.map((tag) => (
              <li className="m-0 p-0" key={tag.databaseId}>
                <Link href={`/blog/tag/${tag.slug}`}>{tag.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>
      <Comments post={post} />
    </article>
  )
}
