import FeaturedImage from '@/components/FeaturedImage'
import getPageBySlug from '@/lib/queries/getPageBySlug'
import {notFound} from 'next/navigation'

/**
 * The homepage route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Home() {
  // Fetch page from WordPress.
  const page = await getPageBySlug('home')

  // No page? Throw a 404.
  if (!page) {
    notFound()
  }

  return (
    <article>
      <FeaturedImage
        image={page.featuredImage}
        hidden={page.hideFeaturedImage.hideFeaturedImage}
      />
      <div dangerouslySetInnerHTML={{__html: page.content}} />
    </article>
  )
}
