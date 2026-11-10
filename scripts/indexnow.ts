/**
 * Tells IndexNow (Bing, Yandex, Naver, Seznam) about posts that changed this
 * week. Runs as Coolify's post-deployment command, after purge-cdn. Google has
 * no IndexNow support; its sitemap resubmit is separate.
 */
import { readFileSync } from 'node:fs'

const SITE_URL = 'https://gregrickaby.com'
const HOST = 'gregrickaby.com'
const KEY = '6f9bef57dcd14da5bf8bd1b79930741c'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000

interface ContentIndex {
  posts: { meta: { slug: string; date: string; modified: string } }[]
}

const content = JSON.parse(
  readFileSync(new URL('../.generated/content.json', import.meta.url), 'utf8'),
) as ContentIndex

const cutoff = Date.now() - WINDOW_MS
const changed = content.posts.filter(({ meta }) => {
  const latest = Math.max(new Date(meta.date).getTime(), new Date(meta.modified).getTime())
  return latest >= cutoff
})

if (changed.length === 0) {
  console.log('IndexNow: no posts changed this week, nothing to submit')
  process.exit(0)
}

const urlList = [
  ...changed.map(({ meta }) => `${SITE_URL}/${meta.slug}`),
  `${SITE_URL}/blog`,
  `${SITE_URL}/`,
]

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList,
  }),
})

if (response.status !== 200 && response.status !== 202) {
  console.error(`IndexNow failed: ${response.status} ${await response.text()}`)
  process.exit(1)
}

console.log(`IndexNow accepted ${urlList.length} URLs (HTTP ${response.status})`)
