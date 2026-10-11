import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { Article } from '@/components/article'
import { getPage } from '@/lib/content'
import { buildContentMetadata } from '@/lib/metadata'

/** The home page shows the About page. */
export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const page = getPage('about')
  return page ? buildContentMetadata(page.meta, '/', parent) : {}
}

export default function HomePage() {
  const page = getPage('about')
  if (!page) notFound()
  return <Article post={page} />
}
