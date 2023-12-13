import FeaturedImage from '@/components/FeaturedImage'
import getPageBySlug from '@/lib/queries/getPageBySlug'
import {notFound} from 'next/navigation'

/**
 * Time-based Revalidation.
 *
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#time-based-revalidation
 */
export const revalidate = 3600

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
        <FeaturedImage
          image={page.featuredImage}
          hidden={page.hideFeaturedImage.hideFeaturedImage}
        />
        <h1 dangerouslySetInnerHTML={{__html: page.title}} />
        <div dangerouslySetInnerHTML={{__html: page.content}} />
      </article>
    </main>
  )
}
