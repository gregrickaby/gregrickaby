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
  priority = false,
}: {
  image: ImageAsset
  slug: string
  alt: string
  sizes: string
  className?: string
  preload?: boolean
  /** The page's LCP image: load it eagerly at high priority. */
  priority?: boolean
}) {
  return (
    <ViewTransition default="none" name={`post-image-${slug}`} share="morph">
      <Image
        alt={alt}
        className={className}
        fetchPriority={priority ? 'high' : undefined}
        height={image.height}
        loading={priority ? 'eager' : undefined}
        preload={preload}
        sizes={sizes}
        src={image.src}
        width={image.width}
      />
    </ViewTransition>
  )
}
