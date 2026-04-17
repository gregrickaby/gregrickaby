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
import {buildFeedXml} from '../lib/feed.ts'
import {siteConfig} from '../lib/config.ts'
import type {PostMeta} from '../lib/types.ts'

const postsDir = join(process.cwd(), 'public', 'content', 'posts')

/**
 * Read and parse frontmatter from all post directories.
 *
 * @returns An array of post metadata objects sorted by date descending.
 */
function getAllPostMeta(): PostMeta[] {
  if (!existsSync(postsDir)) return []

  const slugs = readdirSync(postsDir).filter((name) =>
    statSync(join(postsDir, name)).isDirectory()
  )

  return slugs
    .map((slug) => {
      const filePath = join(postsDir, slug, 'content.mdx')
      if (!existsSync(filePath)) return null
      const {data} = matter(readFileSync(filePath, 'utf-8'))
      return data as PostMeta
    })
    .filter((data): data is PostMeta => data !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const posts = getAllPostMeta()
const feed = buildFeedXml(posts, siteConfig)
writeFileSync(join(process.cwd(), 'public', 'feed.xml'), feed, 'utf-8')
console.log('Generated public/feed.xml')
