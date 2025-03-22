'use client'

import {CarouselImage} from '@/lib/functions/getCarouselImages'
import Image from 'next/image'
import {useEffect, useState} from 'react'
import styles from './Carousel.module.css'

interface CarouselProps {
  /* Optional. Array of image objects with src, alt, width, and height properties. */
  images?: CarouselImage[]
  /* Optional. Time in milliseconds between image transitions. Default: 5000 */
  interval?: number
}

/**
 * Carousel component.
 */
export function Carousel({
  images = [],
  interval = 5000
}: Readonly<CarouselProps>) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Don't set up interval if no images or paused.
    if (images.length === 0) {
      return
    }

    // Set an interval to change the current image.
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
    }, interval)

    // Clean up interval on unmount.
    return () => clearInterval(timer)
  }, [images.length, interval])

  // If no images, return null.
  if (images.length === 0) {
    return null
  }

  return (
    <div className={styles.carousel}>
      {images.map((image, index) => (
        <Image
          key={image.src}
          alt={image.alt}
          className={`${styles.image} ${index === currentIndex ? styles.active : ''}`}
          height={image.height}
          priority={index === 0}
          src={image.src}
          width={image.width}
        />
      ))}
      <div aria-hidden="true" className={styles.overlay}></div>
    </div>
  )
}
