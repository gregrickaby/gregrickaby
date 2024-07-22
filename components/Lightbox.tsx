'use client'

import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX
} from '@tabler/icons-react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

export interface LightboxProps {
  images: string[]
  onClose: () => void
  startIndex: number
}

/**
 * Lightbox component.
 */
export default function Lightbox({images, onClose, startIndex}: LightboxProps) {
  // State to track the current index of the image being displayed.
  const [currentIndex, setCurrentIndex] = useState(startIndex)

  // Refs to track touch start and end positions.
  const touchStartX = useRef(0)

  // Update the current index when startIndex changes.
  useEffect(() => {
    setCurrentIndex(startIndex)

    // Set no-scroll on the body when the lightbox is open.
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [startIndex])

  // Go to the previous image.
  const goPrev = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex + images.length - 1) % images.length
    )
  }, [images.length])

  // Go to the next image.
  const goNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }, [images.length])

  // Determine if there are images.
  const hasImages = useMemo(() => images && images.length > 0, [images])

  // Handle touch start.
  const handleTouchStart = (e: React.TouchEvent<HTMLDialogElement>) => {
    touchStartX.current = e.touches[0].clientX
  }

  // Handle touch end.
  const handleTouchEnd = (e: React.TouchEvent<HTMLDialogElement>) => {
    const touchEndX = e.changedTouches[0].clientX
    if (touchStartX.current - touchEndX > 50) {
      goNext()
    } else if (touchStartX.current - touchEndX < -50) {
      goPrev()
    }
  }

  // Handle keyboard events.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goPrev()
          break
        case 'ArrowRight':
          goNext()
          break
        case 'Escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [goNext, goPrev, onClose])

  // No images? Do not render the lightbox.
  if (!hasImages) {
    return null
  }

  return (
    <dialog
      className="fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-black bg-opacity-95 p-8"
      data-testid="lightbox"
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
    >
      {/* Close button */}
      <button
        aria-label="Close image"
        className="absolute right-4 top-4 z-50 rounded-full bg-black p-1 text-2xl text-white hover:bg-zinc-800"
        data-testid="close-button"
        onClick={onClose}
      >
        <IconX stroke={2} />
      </button>
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg md:flex-row">
        {/* Previous image button */}
        <button
          aria-label="Previous image"
          className="absolute left-4 z-50 rounded-full bg-black p-1 text-white hover:bg-zinc-800"
          data-testid="prev-button"
          onClick={goPrev}
        >
          <IconArrowNarrowLeft stroke={2} />
        </button>
        {/* Image display */}
        <div className="max-w-5xl">
          <img
            alt={`${currentIndex + 1} of ${images.length}`}
            className="rounded border-4 border-white shadow-2xl md:max-h-[720px] md:max-w-[1280px]"
            data-testid="image"
            loading="eager"
            src={images[currentIndex]}
          />
        </div>
        {/* Next image button */}
        <button
          aria-label="Next image"
          className="absolute right-4 z-50 rounded-full bg-black p-1 text-white hover:bg-zinc-800"
          data-testid="next-button"
          onClick={goNext}
        >
          <IconArrowNarrowRight stroke={2} />
        </button>
      </div>
    </dialog>
  )
}
