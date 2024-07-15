'use client'

import Image from 'next/image'
import {useCallback, useState} from 'react'
import Lightbox from './Lightbox'

interface PhotosProps {
  photos: string[]
}

/**
 * Photos component.
 */
export default function Photos({photos}: PhotosProps) {
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

  return (
    <>
      {photos.map((photo, index) => (
        <div
          key={photo}
          onClick={() => openLightbox(index)}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') openLightbox(index)
          }}
          aria-label={`Open photo ${index + 1}`}
        >
          <Image
            alt={`Photo ${index + 1}`}
            height={300}
            src={photo}
            width={425}
          />
        </div>
      ))}
      {/* Conditionally render the lightbox if it is open. */}
      {isOpen && (
        <Lightbox
          images={photos}
          onClose={closeLightbox}
          startIndex={photoIndex}
        />
      )}
    </>
  )
}
