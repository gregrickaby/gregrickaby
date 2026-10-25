import { buildRobotsTxt } from '@/lib/robots'

/** `/robots.txt`, with the Content Signals Policy. Prerendered at build time. */
export function GET() {
  return new Response(buildRobotsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
