import {FeaturedImage} from '@/lib/types'
import Image from 'next/image'

export interface FeaturedImageProps {
  image: FeaturedImage
  hidden: boolean
}

/**
 * Featured Image component.
 */
export default function FeaturedImage({
  image,
  hidden = false
}: Readonly<FeaturedImageProps>) {
  // If there's no image, or it's hidden, don't render anything.
  if (!image || hidden) {
    return null
  }

  return (
    <Image
      alt={image?.node?.altText}
      height="400"
      src={image?.node?.sourceUrl}
      width="896"
      priority={true}
    />
  )
}
