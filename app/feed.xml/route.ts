import { getAllPosts, getBuildTime } from '@/lib/content'
import { buildFeedXml } from '@/lib/feed'
import { SITE } from '@/lib/site'

/** RSS 2.0 feed of every post. Prerendered at build time. */
export function GET() {
  return new Response(buildFeedXml(getAllPosts(), SITE, new Date(getBuildTime())), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
