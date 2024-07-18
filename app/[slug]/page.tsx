import {getPageBySlug} from '@/lib/api'
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
    <article>
      <header>
        <h1 dangerouslySetInnerHTML={{__html: page.title.rendered}} />
      </header>
      <div dangerouslySetInnerHTML={{__html: page.content.rendered}} />
    </article>
  )
}
