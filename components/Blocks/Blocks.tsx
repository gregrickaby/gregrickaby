'use client'

import '@fancyapps/ui/dist/fancybox/fancybox.css'
import {useEffect, useRef} from 'react'

/**
 * Initialize photo gallery.
 */
export async function galleryInit(
  contentRef: React.RefObject<HTMLDivElement | null>
) {
  // On the server? Bail.
  if (typeof window === 'undefined') {
    return
  }

  // No ref? Bail.
  if (!contentRef.current) {
    return
  }

  // Attempt to find the gallery.
  const gallery = contentRef.current.querySelector('.grd-photo-gallery-grid')

  // No gallery? Bail.
  if (!gallery) {
    return
  }

  // Import the libraries on demand.
  const Masonry = (await import('masonry-layout')).default
  const Fancybox = (await import('@fancyapps/ui')).Fancybox
  const imagesLoaded = (await import('imagesloaded')).default

  // Initialize ImagesLoaded.
  const imagesLoadedInstance = imagesLoaded(gallery)

  // Initialize Masonry.
  const masonryGrid = new Masonry(gallery, {
    gutter: 24,
    itemSelector: '.grd-photo-gallery-image',
    columnWidth: '.grd-photo-gallery-grid-sizer',
    percentPosition: true
  })

  // When ImagesLoaded is done, initialize Masonry.
  imagesLoadedInstance.on('done', () => {
    masonryGrid?.layout?.()
  })

  // Initialize Fancybox.
  Fancybox.bind('[data-fancybox]', {
    animated: false,
    groupAll: true,
    defaultDisplay: 'flex',
    Toolbar: {
      display: {
        left: ['infobar'],
        middle: ['zoomIn', 'zoomOut', 'toggle1to1'],
        right: ['slideshow', 'thumbs', 'download', 'close']
      }
    }
  })
}

/**
 * The blocks component.
 *
 * Helps render Gutenberg blocks.
 */
export function Blocks({content}: Readonly<{content: string}>) {
  // Create a ref for the post content.
  const contentRef = useRef<HTMLDivElement>(null)

  /**
   * Initialize the gallery when the component mounts.
   */
  useEffect(() => {
    galleryInit(contentRef)
  }, [content])

  return (
    <div
      ref={contentRef}
      data-testid="blocks"
      dangerouslySetInnerHTML={{__html: content}}
    />
  )
}
