import {Article} from '@/components/Article/Article'
import {siteConfig} from '@/lib/config'
import {getPageBySlug} from '@/lib/content'
import {buildWebPageGraph, serializeSchema} from '@/lib/schema'
import {getFeaturedImagePath} from '@/lib/utils'
import {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'

export async function generateMetadata(
  _: object,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const page = await getPageBySlug('resume')
  if (!page) return {}

  const featuredImage = getFeaturedImagePath(page.meta)
  const previousImages = (await parent).openGraph?.images ?? []

  return {
    title: page.meta.title,
    description: page.meta.description,
    openGraph: {
      title: page.meta.title,
      description: page.meta.description,
      url: `${siteConfig.url}/resume`,
      images: [
        ...(featuredImage ? [{url: `${siteConfig.url}${featuredImage}`}] : []),
        ...previousImages
      ]
    }
  }
}

export default async function ResumePage() {
  const page = await getPageBySlug('resume')

  if (!page) {
    notFound()
  }

  const jsonLd = buildWebPageGraph({
    title: page.meta.title,
    description: page.meta.description ?? siteConfig.description,
    path: 'resume'
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: serializeSchema(jsonLd)}}
      />
      <Article meta={page.meta} content={page.content} />
    </>
  )
}
