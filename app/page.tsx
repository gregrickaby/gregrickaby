import {ArticleCard} from '@/components/ArticleCard'
import {WP_Query} from '@/lib/api'
import Link from 'next/link'

/**
 * The latest posts query.
 *
 * @see https://developer.wordpress.org/rest-api/reference/posts/#arguments
 */
const latestPosts = new WP_Query({
  fields: ['id', 'title', 'slug'],
  order: 'desc',
  orderby: 'date',
  post_type: 'posts',
  per_page: 5
})

/**
 * The home page route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Home() {
  const posts = await latestPosts.getPosts()

  return (
    <div className="article px-12 lg:px-0">
      <h1>Hello There 👋</h1>
      <p>
        I&apos;m a{' '}
        <a
          aria-label="follow on LinkedIn"
          href="https://www.linkedin.com/in/gregrickaby/"
          rel="author"
        >
          full-stack engineer
        </a>
        ,{' '}
        <Link
          aria-label="follow on Threads"
          href="https://www.threads.net/@gregoryrickaby"
          rel="author"
        >
          photography enthusiast
        </Link>
        , and{' '}
        <a
          aria-label="view my amazon author profile"
          href="https://www.amazon.com/author/gregrickaby"
          rel="author"
        >
          published author
        </a>{' '}
        living in Southeast Alabama. I&apos;m married with three kids and some
        of my other hobbies include cooking, traveling, and reading.
      </p>

      <h2>Latest Posts</h2>
      {posts.map((post) => (
        <ArticleCard key={post.id} post={post} />
      ))}

      <footer className="mt-8 text-center">
        <Link href="/blog">See all blog posts</Link>
      </footer>
    </div>
  )
}
