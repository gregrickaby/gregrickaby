'use client'

import '@fancyapps/ui/dist/fancybox/fancybox.css'
import {useEffect, useRef} from 'react'

interface BlocksProps {
  content: string
}

/**
 * The idea is to scan the post content for galleries and initialize
 * 3rd party libraries like Masonry and Fancybox.
 */
export default function Blocks({content}: BlocksProps) {
  // Create a ref for the post content.
  const contentRef = useRef<HTMLDivElement>(null)

  /**
   * Initialize photo gallery.
   */
  async function galleryInit() {
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
          middle: [
            'zoomIn',
            'zoomOut',
            'toggle1to1',
            'rotateCCW',
            'rotateCW',
            'flipX',
            'flipY'
          ],
          right: ['slideshow', 'thumbs', 'download', 'close']
        }
      }
    })

    // Destroy Masonry and Fancybox when the component unmounts.
    return () => {
      masonryGrid?.destroy?.()
      Fancybox.destroy?.()
    }
  }

  /**
   * Initialize the gallery when the component mounts.
   */
  useEffect(() => {
    galleryInit()
  }, [content])

  return (
    <div
      ref={contentRef}
      className="text-lg"
      dangerouslySetInnerHTML={{__html: content}}
    />
  )
}
