import {Blocks} from '@/components/Blocks'
import {WP_Query} from '@/lib/api/WP_Query'
import {fetchPageBySlug} from '@/lib/functions/fetchPageBySlug'
import {sanitizeText} from '@/lib/functions/sanitizeText'
import {yoastSeo} from '@/lib/functions/yoastSeo'

/**
 * Page props.
 */
interface PageProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * Generate all routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Setup the query.
  const query = new WP_Query({
    post_type: 'pages',
    per_page: 100,
    _fields: ['slug']
  })

  // Get the page by slug.
  const pages = await query.getPosts()

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
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Readonly<PageProps>) {
  const params = await props.params
  const page = await fetchPageBySlug(params.slug)
  return yoastSeo(page)
}

/**
 * Single Page.
 */
export default async function SinglePage(props: Readonly<PageProps>) {
  const params = await props.params
  const page = await fetchPageBySlug(params.slug)

  return (
    <article className="article">
      <header>
        <h1>{sanitizeText(page.title.rendered)}</h1>
      </header>
      <Blocks content={page.content.rendered} />
    </article>
  )
}
