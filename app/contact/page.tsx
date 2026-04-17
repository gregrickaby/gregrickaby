import {ContactForm} from '@/components/ContactForm/ContactForm'
import {siteConfig} from '@/lib/config'
import {getPageBySlug} from '@/lib/content'
import {buildContentMetadata} from '@/lib/metadata'
import {buildWebPageGraph, serializeSchema} from '@/lib/schema'
import {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'

export async function generateMetadata(
  _: object,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const page = await getPageBySlug('contact')
  return page ? buildContentMetadata(page.meta, '/contact', parent) : {}
}

export default async function ContactPage() {
  const page = await getPageBySlug('contact')

  if (!page) {
    notFound()
  }

  const jsonLd = buildWebPageGraph({
    title: page.meta.title,
    description: page.meta.description ?? siteConfig.description,
    path: 'contact'
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: serializeSchema(jsonLd)}}
      />
      <ContactForm />
    </>
  )
}
