import Blocks from '@/components/Blocks'
import {getPopularGithubRepos} from '@/lib/functions'
import getPageBySlug from '@/lib/queries/getPageBySlug'
import getPosts from '@/lib/queries/getPosts'
import {notFound} from 'next/navigation'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const runtime = 'nodejs'

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
          <h3>Experience</h3>
          <ul>
            <li>WPForms - Development Team Lead (2023-2024)</li>
            <li>AmericanEagle.com - Technical Lead (2022-2023)</li>
            <li>WebDevStudios - Director of Engineering (2013-2022)</li>
            <li>Bluewater Broadcasting - Chief Engineer (2010-2013)</li>
            <li>Gulf South Communications - Chief Engineer (2002-2009)</li>
            <li>Midwest Communications - Webmaster (1999-2002)</li>
          </ul>
          <h3>Popular GitHub Repos</h3>
          <ul>
            {repos.map((repo) => (
              <li key={repo.id}>
                <a href={repo.html_url}>{repo.name}</a> ({repo.stargazers_count}
                ⭐️)
              </li>
            ))}
          </ul>
          <h3>Blogroll</h3>
          <ul>
            <li>
              <a href="https://petapixel.com/">PetaPixel</a> 📸
            </li>
            <li>
              <a href="https://www.dpreview.com/">DP Review</a> 📸
            </li>
            <li>
              <a href="https://fstoppers.com/">Fstoppers</a> 📸
            </li>
            <li>
              <a href="https://news.ycombinator.com/">Hacker News</a> 💻
            </li>
            <li>
              <a href="https://www.timeanddate.com/news/astronomy/">
                Astronomy News
              </a>{' '}
              🌌
            </li>
            <li>
              <a href="https://www.disneytouristblog.com/">
                Disney Tourist Blog
              </a>{' '}
              🏰
            </li>
            <li>
              <a href="https://make.wordpress.org/core/">Make WordPress Core</a>{' '}
              💻
            </li>
          </ul>
          <h3>Videoroll</h3>
          <ul>
            <li>
              <a href="https://www.youtube.com/@tested">
                Adam Savage&apos;s Tested
              </a>{' '}
              🥼
            </li>
            <li>
              <a href="https://www.youtube.com/@theartofphotography">
                The Art of Photography
              </a>{' '}
              📸
            </li>
            <li>
              <a href="https://www.youtube.com/@HighPrairieSportsmen">
                High Prairie Sportsmen
              </a>{' '}
              🦆
            </li>
            <li>
              <a href="https://www.youtube.com/@TFLtruck">
                The Fast Lane Truck
              </a>{' '}
              🚚
            </li>
            <li>
              <a href="https://www.youtube.com/@KeithCooper">Keith Cooper</a> 🖨️
            </li>
            <li>
              <a href="https://www.youtube.com/@geraldundone">Gerald Undone</a>{' '}
              📸
            </li>
            <li>
              <a href="https://www.youtube.com/@MarkDenneyPhoto">Mark Denny</a>{' '}
              📸
            </li>
            <li>
              <a href="https://www.youtube.com/@DustinAbbottTWI">
                Dustin Abbot
              </a>{' '}
              📸
            </li>
            <li>
              <a href="https://www.youtube.com/@ThePhlogPhotography">
                Christian Möhrle
              </a>{' '}
              📸
            </li>
            <li>
              <a href="https://www.youtube.com/@jherr">Jack Herrington</a> 💻
            </li>
            <li>
              <a href="https://www.youtube.com/@PetaPixel">
                Chris Niccolls and Jordan Drake
              </a>{' '}
              📸
            </li>
            <li>
              <a href="https://www.youtube.com/@AlexArmitage">Alex Armitage</a>{' '}
              📸
            </li>
          </ul>
        </div>
        <div className="homepage-gallery">
          <h3>Recent Photos</h3>
          <Blocks content={photos.content} />
        </div>
      </section>
    </article>
  )
}
