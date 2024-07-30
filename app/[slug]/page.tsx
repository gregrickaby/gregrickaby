import {Blocks} from '@/components/Blocks'
import {WP_Query} from '@/lib/api'
import {yoastSeo} from '@/lib/functions/'
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
  const query = new WP_Query({
    post_type: 'pages',
    slug: params.slug,
    fields: ['content', 'title', 'yoast_head_json']
  })

  // Get the page by slug.
  const [page] = await query.getPosts()

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
  const query = new WP_Query({
    post_type: 'pages',
    slug: params.slug,
    fields: ['content', 'title', 'yoast_head_json']
  })

  // Get the page by slug.
  const [page] = await query.getPosts()

  // No page? No problem.
  if (!page) {
    return notFound()
  }

  return (
    <article className="article">
      <header>
        <h1 dangerouslySetInnerHTML={{__html: page.title.rendered}} />
      </header>
      <Blocks content={page.content.rendered} />
    </article>
  )
}
