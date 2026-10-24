import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/json-ld'
import { Resume } from '@/components/resume'
import { getPage } from '@/lib/content'
import { buildContentMetadata } from '@/lib/metadata'
import { buildWebPageGraph } from '@/lib/schema'
import { SITE } from '@/lib/site'

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const page = getPage('resume')
  return page ? buildContentMetadata(page.meta, '/resume', parent, '/resume.md') : {}
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
