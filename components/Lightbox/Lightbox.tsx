'use client'

import {Threads} from '@/lib/api'
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX
} from '@tabler/icons-react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import styles from './Lightbox.module.css'

export interface LightboxProps {
  photos: Threads
  onClose: () => void
  startIndex: number
}

/**
 * Lightbox component.
 */
export function Lightbox({photos, onClose, startIndex}: LightboxProps) {
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
      (prevIndex) => (prevIndex + photos.data.length - 1) % photos.data.length
    )
  }, [photos.data.length])

  // Go to the next image.
  const goNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.data.length)
  }, [photos.data.length])

  // Determine if there are photos to display.
  const hasData = useMemo(
    () => photos.data && photos.data.length > 0,
    [photos.data]
  )

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

  // No photos.data? Do not render the lightbox.
  if (!hasData) {
    return null
  }

  return (
    <dialog
      className={styles.dialog}
      data-testid="lightbox"
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
    >
      <button
        aria-label="Close image"
        className={styles.close}
        data-testid="close-button"
        onClick={onClose}
      >
        <IconX stroke={2} />
      </button>

      <div className={styles.container}>
        <button
          aria-label="Previous image"
          className={styles.previous}
          data-testid="previous-button"
          onClick={goPrev}
        >
          <IconArrowNarrowLeft stroke={2} />
        </button>

        <figure className={styles.figure}>
          <a
            href={photos.data[currentIndex].permalink}
            title="View post on Threads.net"
          >
            <img
              alt={`${currentIndex + 1} of ${photos.data.length}`}
              className={styles.image}
              data-testid="image"
              loading="eager"
              src={photos.data[currentIndex].media_url}
            />
          </a>
          <figcaption className={styles.caption}>
            {photos.data[currentIndex].text}
          </figcaption>
        </figure>

        <button
          aria-label="Next image"
          className={styles.next}
          data-testid="next-button"
          onClick={goNext}
        >
          <IconArrowNarrowRight stroke={2} />
        </button>
      </div>
    </dialog>
  )
}
