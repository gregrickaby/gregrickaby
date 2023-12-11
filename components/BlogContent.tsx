'use client'

import {Fancybox} from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import imagesLoaded from 'imagesloaded'
import Masonry from 'masonry-layout'
import {useEffect, useRef} from 'react'

interface BlogContentProps {
  content: string
}

/**
 * The idea is to scan the post content for galleries and initialize
 * 3rd party libraries like Masonry and Fancybox.
 */
export default function BlogContent({content}: BlogContentProps) {
  // Create a ref for the post content.
  const contentRef = useRef<HTMLDivElement>(null)

  /**
   * Scan the content for galleries and initialize.
   */
  useEffect(() => {
    // No ref? Bail.
    if (!contentRef.current) {
      return
    }

    // Attempt to find the gallery.
    const gallery = contentRef.current.querySelector('.grd-acf-block-grid')

    // No gallery? Bail.
    if (!gallery) {
      return
    }

    // Initialize Masonry.
    let masonryGrid: Masonry | undefined

    // Initialize ImagesLoaded.
    const imagesLoadedInstance = imagesLoaded(gallery)

    // When ImagesLoaded is done, initialize Masonry.
    imagesLoadedInstance.on('done', () => {
      masonryGrid = new Masonry(gallery, {
        gutter: 24,
        itemSelector: '.grd-acf-block-image',
        columnWidth: '.grd-acf-block-grid-sizer',
        percentPosition: true
      })
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
  }, [content])

  return (
    <div
      ref={contentRef}
      className="text-lg"
      dangerouslySetInnerHTML={{__html: content}}
    />
  )
}
