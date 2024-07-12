import Blocks from '@/components/Blocks'
import FeaturedImage from '@/components/FeaturedImage'
import type {Page} from '@/lib/types'

/**
 * Single page component.
 */
export default function SinglePage({page}: Readonly<{page: Page}>) {
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
