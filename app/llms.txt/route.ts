import { getAllPosts } from '@/lib/content'
import { buildLlmsTxt } from '@/lib/llms'
import { SITE } from '@/lib/site'

/** The `llms.txt` index of each post's Markdown copy. Prerendered at build time. */
export function GET() {
  return new Response(buildLlmsTxt(getAllPosts(), SITE), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
