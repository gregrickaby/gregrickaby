import getPageBySlug from '@/lib/queries/getPageBySlug'
import Image from 'next/image'
import {notFound} from 'next/navigation'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const dynamic = 'force-dynamic'
export const revalidate = 3600

/**
 * The about page route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function About() {
  // Fetch page from WordPress.
  const page = await getPageBySlug('about')

  // No page? Bail...
  if (!page) {
    notFound()
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8">
      <article>
        {page.featuredImage?.node?.mediaDetails?.sizes?.[0] && (
          <Image
            alt={page.featuredImage.node.altText}
            height="400"
            src={page.featuredImage.node.mediaDetails.sizes[0].sourceUrl}
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
