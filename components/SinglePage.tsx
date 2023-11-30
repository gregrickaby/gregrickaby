import {Page} from '@/lib/types'
import Image from 'next/image'

interface SinglePageProps {
  page: Page
}

/**
 * Single page component.
 */
export default function SinglePage({page}: SinglePageProps) {
  return (
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
  )
}
