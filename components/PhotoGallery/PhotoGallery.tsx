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
      showClass: 'f-fadeIn',
      hideClass: 'f-fadeOut'
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
