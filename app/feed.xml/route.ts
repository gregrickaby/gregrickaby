import {WP_Query} from '@/lib/api/WP_Query'
import config from '@/lib/config'
import {sanitizeText} from '@/lib/functions/sanitizeText'
import {Post} from '@/lib/types'
import {NextRequest} from 'next/server'

// Create a new WP_Query instance to fetch posts.
const query = new WP_Query({
  _fields: [
    'slug',
    'title',
    'excerpt',
    'date',
    'author_name',
    'category_names',
    'featured_image_data'
  ],
  per_page: 10,
  post_type: 'posts'
})

/**
 * Generates the RSS feed header including metadata about the site.
 */
function generateRSSHeader() {
  return `
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${sanitizeText(config.siteName)}</title>
      <link>${config.siteUrl}</link>
      <description>${sanitizeText(config.siteDescription)}</description>
      <language>en</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <copyright>2008-${new Date().getFullYear()} - Greg Rickaby</copyright>
      <ttl>60</ttl>
      <docs>https://www.rssboard.org/rss-specification</docs>
      <generator>https://github.com/gregrickaby/gregrickaby</generator>
      <webMaster>greg@gregrickaby.com (Greg Rickaby)</webMaster>
      <atom:link href="${config.siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
  `
}

/**
 * Generates an individual RSS item for a post.
 *
 * @param {Post} post - A post object returned from the WordPress API.
 */
function generateRSSItem(post: Post) {
  return `
    <item>
      <title>${sanitizeText(post.title.rendered)}</title>
      <link>${config.siteUrl}/blog/${post.slug}</link>
      <description>${sanitizeText(`${post.excerpt.rendered}<a href="${config.siteUrl}/blog/${post.slug}">Continue reading</a>`)}</description>

      <author>${sanitizeText(post.author_name)}</author>
      <category>${post.category_names.map((category) => sanitizeText(category.name)).join(', ')}</category>

      ${
        post.featured_image_data
          ? `<enclosure url="${post.featured_image_data.url}" length="1024" type="image/jpeg" />`
          : ''
      }
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${config.siteUrl}/blog/${post.slug}</guid>

      ${
        post.modified && post.modified !== post.date
          ? `<atom:updated>${new Date(post.modified).toUTCString()}</atom:updated>`
          : ''
      }
    </item>
  `
}

/**
 * Generate the RSS feed.
 *
 * @returns {Promise<Response>} - A Response object containing the RSS feed or an error message.
 */
async function handleGenerateFeed(req: NextRequest) {
  try {
    // Fetch posts using the WP_Query instance.
    const posts = await query.getPosts()

    // Handle case where no posts are found.
    if (!posts || posts.length === 0) {
      return new Response('No posts found.', {
        headers: {'Content-Type': 'application/xml; charset=utf-8'}
      })
    }

    // Generate the RSS feed header.
    const rssHeader = generateRSSHeader()

    // Generate RSS items for each post.
    const rssItems = posts.map(generateRSSItem).join('')

    // Concatenate the header and items to form the complete RSS feed.
    const rss = `${rssHeader}${rssItems}</channel></rss>`

    // Return the RSS feed with appropriate headers and caching.
    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=43200' // 12-hour cache
      }
    })
  } catch (error) {
    // Log any errors that occur and return a 500 status code
    console.error('Failed to generate RSS feed:', error)
    return new Response('Internal Server Error', {status: 500})
  }
}

// Export the GET request handler.
export const GET = handleGenerateFeed
