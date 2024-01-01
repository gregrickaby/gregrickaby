import Blocks from '@/components/Blocks'
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
      <FeaturedImage
        image={page.featuredImage}
        hidden={page.hideFeaturedImage.hideFeaturedImage}
      />
      <h1 dangerouslySetInnerHTML={{__html: page.title}} />
      <Blocks content={page.content} />
    </article>
  )
}
