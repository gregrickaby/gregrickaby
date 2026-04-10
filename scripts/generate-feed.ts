/**
 * Generate RSS feed at build time.
 *
 * Reads from public/content and writes to public/feed.xml.
 */
import matter from 'gray-matter'
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'node:fs'
import {join} from 'node:path'
import {siteConfig} from '../lib/config.ts'

const SITE_URL = siteConfig.url
const SITE_NAME = siteConfig.name
const SITE_DESCRIPTION = siteConfig.description

const postsDir = join(process.cwd(), 'public', 'content', 'posts')

function getAllPostMeta() {
  if (!existsSync(postsDir)) return []

  const slugs = readdirSync(postsDir).filter((name) =>
    statSync(join(postsDir, name)).isDirectory()
  )

  return slugs
    .map((slug) => {
      const filePath = join(postsDir, slug, 'content.md')
      if (!existsSync(filePath)) return null
      const {data} = matter(readFileSync(filePath, 'utf-8'))
      return data
    })
    .filter(
      (data): data is matter.GrayMatterFile<string>['data'] => data !== null
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function generateFeed() {
  const posts = getAllPostMeta()

  const items = posts
    .map((post) => {
      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.description || ''}]]></description>
      ${((post.categories as string[]) || []).map((cat: string) => `<category><![CDATA[${cat}]]></category>`).join('\n      ')}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
}

const feed = generateFeed()
writeFileSync(join(process.cwd(), 'public', 'feed.xml'), feed, 'utf-8')
console.log('✅ Generated public/feed.xml')
