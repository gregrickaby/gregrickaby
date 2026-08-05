import {Article} from '@/components/Article/Article'
import {JsonLd} from '@/components/JsonLd/JsonLd'
import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {siteConfig} from './config'
import {getPageBySlug} from './content'
import {buildContentMetadata} from './metadata'
import {buildWebPageGraph} from './schema'
import type {Post} from './types'

/**
 * Result returned by createStaticPage, ready to export from a Next.js page file.
 *
 * @interface
 */
export interface StaticPageResult {
  /** Generates Next.js metadata for the page. */
  generateMetadata: (_: object, parent: ResolvingMetadata) => Promise<Metadata>
  /** Renders the page with JSON-LD structured data and its content. */
  Page: () => Promise<React.ReactElement>
}

/**
 * Creates generateMetadata and a Page component for a static markdown-backed page.
 * The canonical path is derived from the slug (e.g. slug 'about' → '/about').
 *
 * Use this to eliminate boilerplate across pages that follow the pattern:
 * fetch by slug → notFound guard → JSON-LD → content render.
 *
 * @param slug - The page slug matching a directory under public/content/pages/.
 * @param render - Optional. Overrides how the page content renders. Defaults
 *   to `<Article>`. Use this for pages needing custom content, such as the
 *   contact page rendering `<ContactForm>` instead of markdown content.
 * @returns An object with generateMetadata and Page ready to export from a Next.js page file.
 */
export function createStaticPage(
  slug: string,
  render: (page: Post) => React.ReactElement = (page) => (
    <Article meta={page.meta} content={page.content} />
  )
): StaticPageResult {
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
   * Renders the static page with JSON-LD structured data and its content.
   *
   * @returns A React element containing the page's structured data and content.
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
        <JsonLd graph={jsonLd} />
        {render(page)}
      </>
    )
  }

  return {generateMetadata, Page}
}
