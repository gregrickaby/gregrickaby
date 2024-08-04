'use client'

import {Lightbox} from '@/components/Lightbox'
import {Threads} from '@/lib/api'
import {useCallback, useState} from 'react'
import styles from './Gallery.module.css'

export interface GalleryProps {
  photos: Threads
}

/**
 * Photos component.
 */
export function Gallery({photos}: GalleryProps) {
  // Manage whether the lightbox is open.
  const [isOpen, setIsOpen] = useState(false)
  // Manage the index of the currently selected photo.
  const [photoIndex, setPhotoIndex] = useState(0)

  // Open the lightbox and set the current photo index.
  const openLightbox = useCallback((index: number) => {
    setPhotoIndex(index)
    setIsOpen(true)
  }, [])

  // Close the lightbox.
  const closeLightbox = useCallback(() => {
    setIsOpen(false)
  }, [])

  // No photos? Don't render.
  if (!photos || photos.data.length === 0) {
    return null
  }

  return (
    <div className={styles.gallery} data-testid="gallery">
      {photos.data.map((photo, index) => (
        <div
          aria-label={`Open photo ${photo.text}`}
          className={styles.photo}
          data-testid={`photo-${index}`}
          key={photo.id}
          onClick={() => openLightbox(index)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') openLightbox(index)
          }}
          role="button"
          tabIndex={0}
        >
          <img
            alt={photo.text}
            height={300}
            loading="lazy"
            src={photo.media_url}
            width={425}
          />
        </div>
      ))}

      {isOpen && (
        <Lightbox
          photos={photos}
          onClose={closeLightbox}
          startIndex={photoIndex}
        />
      )}
    </div>
  )
}
