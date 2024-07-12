import config from '@/lib/config'
import getPosts from '@/lib/queries/getPosts'
import escape from 'xml-escape'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const revalidate = 43200 // 12 hours

/**
 * Route handler for generating RSS feed.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route
 */
export async function GET() {
  try {
    // Fetch all blog posts.
    const posts = await getPosts()

    // No posts? Bail.
    if (!posts) {
      return new Response('No posts found.', {
        headers: {'Content-Type': 'application/xml; charset=utf-8'}
      })
    }

    // Construct the RSS header.
    const rssHeader = `
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${config.siteName}</title>
        <link>${config.siteUrl}</link>
        <description>${config.siteDescription}</description>
        <language>en</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <copyright>2008-${new Date().getFullYear()} - Greg Rickaby</copyright>
        <ttl>60</ttl>
        <docs>https://www.rssboard.org/rss-specification</docs>
        <generator>https://github.com/gregrickaby/gregrickaby</generator>
        <webMaster>greg@gregrickaby.com (Greg Rickaby)</webMaster>
        <atom:link href="${config.siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    `

    // Construct the RSS items.
    const rssItems = posts.edges
      .map(
        ({node}) => `
        <item>
          <title>${escape(node.title)}</title>
          <link>${config.siteUrl}/blog/${node.slug}</link>
          <description>${escape(`${node.excerpt}<a href="${config.siteUrl}/blog/${node.slug}">Continue reading</a>`)}</description>
          <author>${node.author.node.name}</author>
          <category>${node.categories.edges[0].node.name}</category>
          <enclosure url="${node.featuredImage?.node.sourceUrl}" length="1024" type="image/jpeg" />
          <pubDate>${new Date(node.date).toUTCString()}</pubDate>
          <guid>${config.siteUrl}/blog/${node.slug}</guid>
        </item>
    `
      )
      .join('')

    // Merge the header and items.
    const rss = `${rssHeader}${rssItems}</channel></rss>`

    // Return the RSS feed.
    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=43200'
      }
    })
  } catch (error) {
    console.error('Failed to generate RSS feed:', error)
    return new Response('Internal Server Error', {status: 500})
  }
}
