import {FeaturedImage} from '@/lib/types'
import Image from 'next/image'

export interface FeaturedImageProps {
  image: FeaturedImage
}

/**
 * Featured Image component.
 */
export default function FeaturedImage({image}: FeaturedImageProps) {
  // If there's no image, return null.
  if (!image) {
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
