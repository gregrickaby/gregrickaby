'use client'

import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX
} from '@tabler/icons-react'
import {useEffect, useState} from 'react'

interface LightboxProps {
  images: string[]
  startIndex: number
  onClose: () => void
}

/**
 * Lightbox component.
 */
export default function Lightbox({images, startIndex, onClose}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex)

  useEffect(() => {
    setCurrentIndex(startIndex)
  }, [startIndex])

  const goPrev = () => {
    setCurrentIndex((currentIndex + images.length - 1) % images.length)
  }

  const goNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length)
  }

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-16">
      <button
        className="absolute right-4 top-4 rounded-full bg-black p-1 text-2xl text-white hover:bg-zinc-800"
        onClick={onClose}
      >
        <IconX stroke={2} />
      </button>
      <div className="relative">
        <button
          className="absolute -left-12 top-1/2 -translate-y-1/2 transform rounded-full bg-black p-1 text-white hover:bg-zinc-800"
          onClick={goPrev}
        >
          <IconArrowNarrowLeft stroke={2} />
        </button>
        <img
          alt=""
          className="max-h-full max-w-full"
          loading="eager"
          src={images[currentIndex]}
        />
        <button
          className="absolute -right-12 top-1/2 -translate-y-1/2 transform rounded-full bg-black p-1 text-white hover:bg-zinc-800"
          onClick={goNext}
        >
          <IconArrowNarrowRight stroke={2} />
        </button>
      </div>
    </div>
  )
}
