import SinglePage from '@/components/SinglePage'
import {notFoundSeoHandler, seoHandler} from '@/lib/functions'
import getPageBySlug from '@/lib/queries/getPageBySlug'
import getPages from '@/lib/queries/getPages'
import {Metadata} from 'next'
import {notFound} from 'next/navigation'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const revalidate = 43200 // 12 hours

/**
 * Generate the static routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Get pages.
  const pages = await getPages()

  // No pages? Bail...
  if (!pages) {
    return []
  }

  // Return the slugs for each page.
  return pages.map((page: {slug: string}) => ({
    slug: page.slug
  }))
}

/**
 * Generate the metadata for each static route at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({
  params
}: {
  params: {slug: string}
}): Promise<Metadata | null> {
  // Get the page.
  const page = await getPageBySlug(params.slug)

  // No page? Return 404 metadata.
  if (!page) {
    return notFoundSeoHandler(params.slug)
  }

  return seoHandler(page)
}

/**
 * The single page route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Page({params}: {params: {slug: string}}) {
  // Fetch a page from WordPress.
  const page = await getPageBySlug(params.slug)

  // No page? Throw a 404.
  if (!page) {
    notFound()
  }

  return <SinglePage page={page} />
}
