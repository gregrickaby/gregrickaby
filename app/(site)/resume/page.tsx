import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { Resume } from '@/components/resume'
import { JsonLd } from '@/components/json-ld'
import { getPage } from '@/lib/content'
import { buildContentMetadata } from '@/lib/metadata'
import { buildWebPageGraph } from '@/lib/schema'
import { SITE } from '@/lib/site'

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const page = getPage('resume')
  return page ? buildContentMetadata(page.meta, '/resume', parent) : {}
}

export default function ResumePage() {
  const page = getPage('resume')
  if (!page) notFound()
  const graph = buildWebPageGraph({
    title: page.meta.title,
    description: page.meta.description ?? SITE.description,
    path: 'resume',
  })

  return (
    <>
      <JsonLd graph={graph} />
      <Resume />
    </>
  )
}
