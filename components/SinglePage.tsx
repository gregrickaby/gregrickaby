import Blocks from '@/components/Blocks'
import FeaturedImage from '@/components/FeaturedImage'
import {Page} from '@/lib/types'

/**
 * Single page component.
 */
export default function SinglePage({page}: {page: Page}) {
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
