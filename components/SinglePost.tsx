import Comments from '@/components/Comments'
import {formatDate} from '@/lib/functions'
import {Post} from '@/lib/types'
import LatestPosts from './LatestPosts'

interface SinglePostProps {
  post: Post
  latestPosts: Post[]
}

/**
 * Single post component.
 */
export default function SinglePost({post, latestPosts}: SinglePostProps) {
  return (
    <article>
      <header>
        <h1
          className="m-0 p-0 text-2xl font-bold leading-none"
          dangerouslySetInnerHTML={{__html: post.title}}
        />
        <p className="mt-4 italic">
          By {post.author.node.name} on{' '}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
      </header>

      <div
        className="text-lg"
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
      <Comments post={post} />
      <LatestPosts posts={latestPosts} />
    </article>
  )
}
