import FeaturedImage from '@/components/FeaturedImage'
import {Page} from '@/lib/types'

interface SinglePageProps {
  page: Page
}

/**
 * Single page component.
 */
export default function SinglePage({page}: SinglePageProps) {
  return (
    <article>
      <FeaturedImage image={page.featuredImage} />
      <h1 dangerouslySetInnerHTML={{__html: page.title}} />
      <div dangerouslySetInnerHTML={{__html: page.content}} />
    </article>
  )
}
