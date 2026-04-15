'use client'

import {PhotoCard} from '@/components/PhotoCard/PhotoCard'
import type {PhotoMeta} from '@/lib/types'
import {Fancybox} from '@fancyapps/ui/dist/fancybox/'
import {useEffect, useRef} from 'react'
import styles from './PhotoGallery.module.css'

import '@fancyapps/ui/dist/fancybox/fancybox.css'

/**
 * Props for the PhotoGallery component.
 *
 * @interface
 */
interface PhotoGalleryProps {
  /** Array of photo metadata to display. */
  photos: PhotoMeta[]
}

/**
 * Client component that renders a masonry grid of photos with Fancybox
 * lightbox integration. Binds Fancybox on mount and unbinds on cleanup.
 *
 * @param props - The props for the PhotoGallery component.
 * @returns A React element with the photo masonry grid.
 */
export function PhotoGallery({photos}: Readonly<PhotoGalleryProps>) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    Fancybox.bind(container, '[data-fancybox]', {
      theme: 'auto',
      mainStyle: {
        '--f-toolbar-padding': '0',
        '--f-button-svg-stroke-width': '1.5',
        '--f-arrow-svg-stroke-width': '1.75',
        '--f-thumb-width': '82px',
        '--f-thumb-height': '82px',
        '--f-thumb-border-radius': '8px',
        '--f-thumb-selected-shadow': 'inset 0 0 0 2px #fff, 0 0 0 1.5px #a73c00'
      },
      dragToClose: false,
      fadeEffect: false,
      hideClass: false,
      showClass: 'f-fadeIn',
      zoomEffect: false,
      Carousel: {
        Toolbar: {
          absolute: false,
          display: {
            left: [''],
            middle: ['counter'],
            right: ['toggleFull', 'close']
          }
        }
      }
    })

    return () => Fancybox.unbind(container, '[data-fancybox]')
  }, [])

  return (
    <div className={styles.gallery} ref={containerRef}>
      {photos.map((photo, index) => (
        <PhotoCard key={photo.filename} photo={photo} priority={index < 6} />
      ))}
    </div>
  )
}
