import type {PostMeta} from '@/lib/types'

/**
 * Subset of site configuration required to build the RSS feed.
 */
interface FeedConfig {
  /** Canonical site URL, without a trailing slash. */
  url: string
  /** Site display name used as the channel title. */
  name: string
  /** One-sentence site description for the channel. */
  description: string
}

/**
 * Build an RSS 2.0 XML item string for a single post.
 *
 * @param post - Post metadata.
 * @param siteUrl - The base URL of the site.
 * @returns An XML string representing a single RSS `<item>`.
 */
function buildItemXml(post: PostMeta, siteUrl: string): string {
  const categories = (post.categories ?? [])
    .map((cat) => `<category><![CDATA[${cat}]]></category>`)
    .join('\n      ')

  return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.description ?? ''}]]></description>
      ${categories}
    </item>`
}

/**
 * Build an RSS 2.0 XML string from post metadata.
 *
 * @param posts - Array of post metadata, pre-sorted by date descending.
 * @param config - Site configuration used for channel metadata (url, name, description).
 * @param builtAt - Optional build timestamp; defaults to now. Pass a fixed
 *                  Date in tests for deterministic output.
 * @returns An RSS 2.0 XML string.
 */
export function buildFeedXml(
  posts: PostMeta[],
  config: FeedConfig,
  builtAt: Date = new Date()
): string {
  const items = posts.map((post) => buildItemXml(post, config.url)).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.name}</title>
    <link>${config.url}</link>
    <description>${config.description}</description>
    <language>en-US</language>
    <lastBuildDate>${builtAt.toUTCString()}</lastBuildDate>
    <atom:link href="${config.url}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
}
