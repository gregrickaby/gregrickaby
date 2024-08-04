import {ArticleCard} from '@/components/ArticleCard'
import {WP_Query, getGithubRepos} from '@/lib/api'
import Link from 'next/link'

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
  const repos = await getGithubRepos(7)

  return (
    <div className="two-col">
      <article className="article">
        <header>
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
            , <Link href="/photos">photography enthusiast</Link>, and{' '}
            <a
              aria-label="view my amazon author profile"
              href="https://www.amazon.com/author/gregrickaby"
              rel="author"
            >
              published author
            </a>{' '}
            living in Southeast Alabama. I&apos;m married with three kids and
            some of my other hobbies include cooking, traveling, and reading.
          </p>
        </header>

        <h2>Latest Posts</h2>
        {posts.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </article>
      <aside className="sidebar">
        <div>
          <h3>Hobby Apps</h3>
          <ul>
            <li>
              <a href="https://spellingscramble.vercel.app">
                Spelling Scramble
              </a>
            </li>
            <li>
              <a href="https://preschool-flashcards.vercel.app">
                Preschool Flashcards
              </a>
            </li>
            <li>
              <a href="https://redditviewer.vercel.app">Reddit Viewer</a>
            </li>
            <li>
              <a href="https://localwx.vercel.app">Local Weather</a>
            </li>
          </ul>
        </div>
        <div>
          <h3>Popular GitHub Repos</h3>
          <ul>
            {repos.map((repo) => (
              <li key={repo.id}>
                <a href={repo.html_url}>{repo.name}</a> ({repo.stargazers_count}
                ⭐️)
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Blogroll</h3>
          <ul>
            <li>
              <a href="https://petapixel.com/">PetaPixel</a>
            </li>
            <li>
              <a href="https://www.dpreview.com/">DP Review</a>
            </li>
            <li>
              <a href="https://news.ycombinator.com/">Hacker News</a>
            </li>
            <li>
              <a href="https://www.timeanddate.com/news/astronomy/">
                Astronomy News
              </a>{' '}
            </li>
            <li>
              <a href="https://www.disneytouristblog.com/">
                Disney Tourist Blog
              </a>{' '}
            </li>
          </ul>
        </div>
      </aside>
    </div>
  )
}
