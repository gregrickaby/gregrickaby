import {Article} from '@/components/Article/Article'
import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {siteConfig} from './config'
import {getPageBySlug} from './content'
import {buildContentMetadata} from './metadata'
import {buildWebPageGraph, serializeSchema} from './schema'

/**
 * Creates generateMetadata and a Page component for a static markdown-backed page.
 * The canonical path is derived from the slug (e.g. slug 'about' → '/about').
 *
 * Use this to eliminate boilerplate across pages that follow the pattern:
 * fetch by slug → notFound guard → JSON-LD → Article render.
 *
 * @param slug - The page slug matching a directory under public/content/pages/.
 * @returns An object with generateMetadata and Page ready to export from a Next.js page file.
 */
export function createStaticPage(slug: string): {
  generateMetadata: (_: object, parent: ResolvingMetadata) => Promise<Metadata>
  Page: () => Promise<React.ReactElement>
} {
  const canonicalPath = `/${slug}`

  /**
   * Generates Next.js metadata for the page.
   *
   * @param _ - Unused route params.
   * @param parent - The ResolvingMetadata passed in by Next.js.
   * @returns A Metadata object, or an empty object if the page is not found.
   */
  async function generateMetadata(
    _: object,
    parent: ResolvingMetadata
  ): Promise<Metadata> {
    const page = await getPageBySlug(slug)
    return page ? buildContentMetadata(page.meta, canonicalPath, parent) : {}
  }

  /**
   * Renders the static page with JSON-LD structured data and article content.
   *
   * @returns A React element containing the page's structured data and article.
   */
  async function Page(): Promise<React.ReactElement> {
    const page = await getPageBySlug(slug)

    if (!page) {
      notFound()
    }

    const jsonLd = buildWebPageGraph({
      title: page.meta.title,
      description: page.meta.description ?? siteConfig.description,
      path: slug
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

  return {generateMetadata, Page}
}
