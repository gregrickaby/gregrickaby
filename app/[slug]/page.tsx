import {getPageBySlug} from '@/lib/api'
import {yoastSeo} from '@/lib/functions'
import {notFound} from 'next/navigation'

/**
 * Page props.
 */
interface PageProps {
  params: {
    slug: string
  }
}

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({params}: PageProps) {
  // Get a page by slug.
  const page = await getPageBySlug(params.slug)

  // No page? No problem.
  if (!page) {
    return notFound()
  }

  return yoastSeo(page)
}

/**
 * Single Page.
 */
export default async function BlogPost({params}: PageProps) {
  // Get the page by slug.
  const page = await getPageBySlug(params.slug)

  // No page? No problem.
  if (!page) {
    return notFound()
  }

  return (
    <article className="article">
      <header>
        <h1 dangerouslySetInnerHTML={{__html: page.title.rendered}} />
      </header>
      <div dangerouslySetInnerHTML={{__html: page.content.rendered}} />
    </article>
  )
}
