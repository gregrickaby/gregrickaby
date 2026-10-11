import Image from 'next/image'
import { ViewTransition } from 'react'
import type { ImageAsset } from '@/lib/types'

/**
 * A post's featured image. The card and the article share a view-transition
 * name, so opening a post morphs the card image into the hero.
 */
export function PostImage({
  image,
  slug,
  alt,
  sizes,
  className,
  preload = false,
}: {
  image: ImageAsset
  slug: string
  alt: string
  sizes: string
  className?: string
  preload?: boolean
}) {
  return (
    <ViewTransition default="none" name={`post-image-${slug}`} share="morph">
      <Image
        alt={alt}
        className={className}
        height={image.height}
        preload={preload}
        sizes={sizes}
        src={image.src}
        width={image.width}
      />
    </ViewTransition>
  )
}
