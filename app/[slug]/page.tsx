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
    <article className="prose mx-auto max-w-3xl px-12 lg:prose-xl dark:prose-invert lg:px-0">
      <header>
        <h1
          className="not-prose mb-6 font-title text-3xl font-bold lg:text-6xl lg:leading-[1.1]"
          dangerouslySetInnerHTML={{__html: page.title.rendered}}
        />
      </header>
      <div dangerouslySetInnerHTML={{__html: page.content.rendered}} />
    </article>
  )
}
