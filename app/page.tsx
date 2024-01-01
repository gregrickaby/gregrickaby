import Blocks from '@/components/Blocks'
import {getPopularGithubRepos} from '@/lib/functions'
import getPageBySlug from '@/lib/queries/getPageBySlug'
import getPosts from '@/lib/queries/getPosts'
import {notFound} from 'next/navigation'

/**
 * The home page route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Home() {
  // Fetch homepage data.
  const page = await getPageBySlug('home')
  const posts = await getPosts(5)
  const repos = await getPopularGithubRepos()
  const photos = await getPageBySlug('recent')

  // No page? Throw a 404.
  if (!page) {
    notFound()
  }

  return (
    <article>
      <Blocks content={page.content} />
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2>Latest Posts</h2>
          <ul>
            {posts.edges.map(({node}) => (
              <li key={node.databaseId}>
                <a href={`/blog/${node.slug}`}>{node.title}</a>
              </li>
            ))}
          </ul>
          <h2>Popular GitHub Repos</h2>
          <ul>
            {repos.map((repo) => (
              <li key={repo.id}>
                <a href={repo.html_url}>{repo.name}</a> ({repo.stargazers_count}
                )
              </li>
            ))}
          </ul>
          <h2>Blogroll</h2>
          <ul>
            <li>
              <a href="https://petapixel.com/">PetaPixel</a>
            </li>
            <li>
              <a href="https://news.ycombinator.com/">Hacker News</a>
            </li>
            <li>
              <a href="https://www.timeanddate.com/news/astronomy/">
                Astronomy News
              </a>
            </li>
            <li>
              <a href="https://www.disneytouristblog.com/">
                Disney Tourist Blog
              </a>
            </li>
            <li>
              <a href="https://make.wordpress.org/core/">Make WordPress Core</a>
            </li>
          </ul>
        </div>
        <div>
          <h2>Recent Photos</h2>
          <ul>
            <Blocks content={photos.content} />
          </ul>
        </div>
      </div>
    </article>
  )
}
