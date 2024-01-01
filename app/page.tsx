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
      <h2 className="m-0 p-0">Welcome</h2>
      <Blocks content={page.content} />
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h3>Latest Posts</h3>
          <ul>
            {posts.edges.map(({node}) => (
              <li key={node.databaseId}>
                <a href={`/blog/${node.slug}`}>{node.title}</a>
              </li>
            ))}
          </ul>
          <h3>Popular GitHub Repos</h3>
          <ul>
            {repos.map((repo) => (
              <li key={repo.id}>
                <a href={repo.html_url}>{repo.name}</a> ({repo.stargazers_count}
                )
              </li>
            ))}
          </ul>
          <h3>Blogroll</h3>
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
          <h3>Recent Photos</h3>
          <ul>
            <Blocks content={photos.content} />
          </ul>
        </div>
      </section>
    </article>
  )
}
