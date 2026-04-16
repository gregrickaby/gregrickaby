import {ContactForm} from '@/components/ContactForm/ContactForm'
import {siteConfig} from '@/lib/config'
import {getPageBySlug} from '@/lib/content'
import {buildWebPageGraph, serializeSchema} from '@/lib/schema'
import {getFeaturedImagePath} from '@/lib/utils'
import {Metadata, ResolvingMetadata} from 'next'

export async function generateMetadata(
  _: object,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const page = await getPageBySlug('contact')

  const featuredImage = page ? getFeaturedImagePath(page.meta) : null
  const previousImages = (await parent).openGraph?.images ?? []

  return {
    title: 'Contact',
    description: 'Use the form on this page to get in touch.',
    alternates: {
      canonical: '/contact'
    },
    openGraph: {
      title: 'Contact',
      description: 'Use the form on this page to get in touch.',
      url: `${siteConfig.url}/contact`,
      images: [
        ...(featuredImage ? [{url: `${siteConfig.url}${featuredImage}`}] : []),
        ...previousImages
      ]
    }
  }
}

export default function ContactPage() {
  const jsonLd = buildWebPageGraph({
    title: 'Contact',
    description: 'Use the form on this page to get in touch.',
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
