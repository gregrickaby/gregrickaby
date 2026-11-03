import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import { CameraGear } from '@/components/camera-gear'
import { JsonLd } from '@/components/json-ld'
import { PageTitle } from '@/components/page-title'
import { getPage } from '@/lib/content'
import { buildContentMetadata } from '@/lib/metadata'
import { buildWebPageGraph } from '@/lib/schema'
import { SITE } from '@/lib/site'

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const page = getPage('gear')
  return page ? buildContentMetadata(page.meta, '/gear', parent) : {}
}

export default function GearPage() {
  const page = getPage('gear')
  if (!page) notFound()
  const graph = buildWebPageGraph({
    title: page.meta.title,
    description: page.meta.description ?? SITE.description,
    path: 'gear',
  })

  return (
    <>
      <JsonLd graph={graph} />
      <PageTitle>{page.meta.title}</PageTitle>
      <CameraGear page={page} />
    </>
  )
}
