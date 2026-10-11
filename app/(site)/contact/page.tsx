import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { ContactForm } from '@/components/islands/contact-form'
import { PageTitle } from '@/components/page-title'
import { JsonLd } from '@/components/json-ld'
import { getPage } from '@/lib/content'
import { buildContentMetadata } from '@/lib/metadata'
import { buildWebPageGraph } from '@/lib/schema'
import { SITE } from '@/lib/site'

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const page = getPage('contact')
  return page ? buildContentMetadata(page.meta, '/contact', parent) : {}
}

export default function ContactPage() {
  const page = getPage('contact')
  if (!page) notFound()
  const graph = buildWebPageGraph({
    title: page.meta.title,
    description: page.meta.description ?? SITE.description,
    path: 'contact',
  })

  return (
    <>
      <JsonLd graph={graph} />
      <>
        <PageTitle>{page.meta.title}</PageTitle>
        <ContactForm />
      </>
    </>
  )
}
