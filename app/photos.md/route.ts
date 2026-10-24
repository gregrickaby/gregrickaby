import { getPhotos } from '@/lib/content'
import { buildPhotosMarkdown } from '@/lib/llms'

/** The photo gallery as Markdown, linked from `llms.txt`. Prerendered at build time. */
export function GET() {
  return new Response(buildPhotosMarkdown(getPhotos()), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
