import config from '@/lib/config'
import getPosts from '@/lib/queries/getPosts'
import escape from 'xml-escape'

/**
 * Route segment config.
 *
 * Force static generation of route and revalidate every 5 minutes.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const revalidate = 300

/**
 * Route handler for generating RSS feed.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route
 */
export async function GET() {
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

  // Start of RSS feed.
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${config.siteName}</title>
    <description>${config.siteDescription}</description>
    <link>${config.siteUrl}</link>
    <generator>RSS for Node and Next.js</generator>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>`

  // Add posts to RSS feed.
  allPosts.edges.forEach(({node}) => {
    rss += `
    <item>
      <title>${escape(node.title)}</title>
      <description>${escape(node.excerpt)}</description>
      <link>${config.siteUrl}/blog/${node.slug}</link>
      <guid>${config.siteUrl}/blog/${node.slug}</guid>
      <pubDate>${new Date(node.date).toUTCString()}</pubDate>
    </item>`
  })

  // Close channel and rss tag.
  rss += `
  </channel>
</rss>`

  // Return response.
  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  })
}
