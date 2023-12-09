import getPageBySlug from '@/lib/queries/getPageBySlug'
import Image from 'next/image'
import {notFound} from 'next/navigation'

/**
 * The homepage route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Home() {
  // Fetch page from WordPress.
  const page = await getPageBySlug('about')

  // No page? Throw a 404.
  if (!page) {
    notFound()
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8">
      <article>
        {page.featuredImage?.node && (
          <Image
            alt={page.featuredImage.node.altText}
            height="400"
            src={page.featuredImage.node.sourceUrl}
            width="768"
            priority={true}
          />
        )}
        <h1 dangerouslySetInnerHTML={{__html: page.title}} />
        <div dangerouslySetInnerHTML={{__html: page.content}} />
      </article>
    </main>
  )
}
