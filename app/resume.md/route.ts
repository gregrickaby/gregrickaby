import { getBuildTime } from '@/lib/content'
import { buildResumeMarkdown } from '@/lib/llms'

/** The resume as Markdown, linked from `llms.txt`. Prerendered at build time. */
export function GET() {
  return new Response(buildResumeMarkdown(new Date(getBuildTime())), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
