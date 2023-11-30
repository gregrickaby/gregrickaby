import config from '@/lib/config'
import getPosts from '@/lib/queries/getPosts'
import RSS from 'rss'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const dynamic = 'force-dynamic'
export const revalidate = 3600

/**
 * Route handler.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route
 * @see https://www.npmjs.com/package/rss
 */
export async function GET() {
  // Instantiate RSS feed.
  const feed = new RSS({
    title: config.siteName,
    description: config.siteDescription,
    generator: 'RSS for Node and Next.js',
    feed_url: `${config.siteUrl}/feed.xml/`,
    site_url: config.siteUrl,
    managingEditor: `${config.email} (${config.siteName})`,
    webMaster: `${config.email} (${config.siteName})`,
    copyright: `Copyright 2008-${new Date().getFullYear().toString()}, ${
      config.siteName
    }`,
    language: 'en-US',
    pubDate: new Date().toUTCString(),
    ttl: 60
  })

  // Fetch all posts.
  const allPosts = await getPosts()

  // If no posts, return response.
  if (!allPosts) {
    return new Response('No posts found.', {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8'
      }
    })
  }

  // Add posts to feed.
  allPosts.map((post) => {
    feed.item({
      title: post.title,
      description: post.excerpt,
      url: `${config.siteUrl}/blog/${post.slug}`,
      author: config.siteName,
      date: post.date
    })
  })

  // Return response.
  return new Response(feed.xml({indent: true}), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  })
}
