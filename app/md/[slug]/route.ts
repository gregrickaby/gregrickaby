import { getMarkdownSlugs, getPostMarkdown } from '@/lib/markdown'

export function generateStaticParams() {
  return getMarkdownSlugs().map((slug) => ({ slug }))
}

/** A post's Markdown copy, served at `/<slug>.md`. Prerendered at build time. */
export async function GET(_request: Request, { params }: RouteContext<'/md/[slug]'>) {
  const { slug } = await params
  const markdown = getPostMarkdown(slug)
  if (markdown === null) return new Response('Not found', { status: 404 })
  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
