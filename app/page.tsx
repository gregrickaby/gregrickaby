import {ArticleCard} from '@/components/ArticleCard/ArticleCard'
import {WP_Query} from '@/lib/api/WP_Query'
import Link from 'next/link'

/**
 * The latest posts query.
 *
 * @see https://developer.wordpress.org/rest-api/reference/posts/#arguments
 */
const latestPosts = new WP_Query({
  _fields: ['id', 'title', 'slug', 'excerpt', 'featured_image_data', 'date'],
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
      <h1>👋 Hello There!</h1>
      <p>
        I&apos;m a{' '}
        <a
          aria-label="follow on LinkedIn"
          href="https://www.linkedin.com/in/gregrickaby/"
          rel="author"
        >
          web developer
        </a>
        ,{' '}
        <Link aria-label="view my photos" href="/photos">
          photography enthusiast
        </Link>
        , and{' '}
        <a
          aria-label="view my amazon author profile"
          href="https://www.amazon.com/author/gregrickaby"
          rel="author"
        >
          author
        </a>{' '}
        who&apos;s been building websites since the{' '}
        <a
          aria-label="view my geocties web page"
          href="https://gregrickaby.com/geocities"
          rel="nofollow"
        >
          Geocities
        </a>{' '}
        days. Married with three kids, I enjoy cooking, traveling, and reading.
        As a Technical Lead at <a href="https://mindsize.com/">Mindsize</a>, I
        support a talented team working on e-comm solutions with Next.js.
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
