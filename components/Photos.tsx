'use client'

import Image from 'next/image'
import {useState} from 'react'
import Lightbox from './Lightbox'

interface PhotosProps {
  photos: string[]
}

export default function Photos({photos}: PhotosProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  const openLightbox = (index: number) => {
    setPhotoIndex(index)
    setIsOpen(true)
  }

  return (
    <>
      {photos.map((photo, index) => (
        <div
          key={photo}
          onClick={() => openLightbox(index)}
          className="cursor-pointer"
          role="button"
        >
          <Image
            alt={`Photo ${index + 1}`}
            height={300}
            src={photo}
            width={425}
          />
        </div>
      ))}
      {isOpen && (
        <Lightbox
          images={photos}
          onClose={() => setIsOpen(false)}
          startIndex={photoIndex}
        />
      )}
    </>
  )
}
