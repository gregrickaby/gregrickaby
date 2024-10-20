import {WP_Query} from '@/lib/api'
import config from '@/lib/config'
import escape from 'xml-escape'

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

export async function GET() {
  try {
    const posts = await query.getPosts()

    if (!posts) {
      return new Response('No posts found.', {
        headers: {'Content-Type': 'application/xml; charset=utf-8'}
      })
    }

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

    const rssItems = posts
      .map(
        (post) => `
        <item>
          <title>${escape(post.title.rendered)}</title>
          <link>${config.siteUrl}/blog/${post.slug}</link>
          <description>${escape(`${post.excerpt.rendered}<a href="${config.siteUrl}/blog/${post.slug}">Continue reading</a>`)}</description>
          <author>${post.author_name}</author>
          <category>${post.category_names.map((category) => category.name).join(', ')}</category>
          <enclosure url="${post.featured_image_data?.url}" length="1024" type="image/jpeg" />
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <guid>${config.siteUrl}/blog/${post.slug}</guid>
          ${
            post.modified && post.modified !== post.date
              ? `<atom:updated>${new Date(post.modified).toUTCString()}</atom:updated>`
              : ''
          }
        </item>
    `
      )
      .join('')

    const rss = `${rssHeader}${rssItems}</channel></rss>`

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
