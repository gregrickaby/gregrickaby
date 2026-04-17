'use client'

import {getCaption} from '@/lib/utils'
import {useEffect, useRef, useState} from 'react'
import type {SlideImage} from 'yet-another-react-lightbox'

/**
 * Return value of the useLightbox hook.
 *
 * @interface
 */
export interface UseLightboxResult {
  /** Ref to attach to the container element whose images should be lightboxed. */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Array of image slides built from the container's img elements. */
  slides: SlideImage[]
  /** Index of the currently open slide, or -1 when closed. */
  lightboxIndex: number
  /** Closes the lightbox by resetting the index to -1. */
  closeLightbox: () => void
}

/**
 * Scans a container element for img elements, builds a YARL slide array from
 * them, and attaches click handlers so clicking any image opens the lightbox
 * at the correct index.
 *
 * The slides are built in a first effect (runs once on mount). Click listeners
 * are attached in a second effect that depends on `slides.length`, so they run
 * after the re-render triggered by `setSlides` settles — avoiding a race where
 * `dangerouslySetInnerHTML` replaces the DOM nodes between the two operations.
 *
 * @returns An object containing the container ref, slides array, current index,
 *   and a function to close the lightbox.
 */
export function useLightbox(): UseLightboxResult {
  const containerRef = useRef<HTMLDivElement>(null)
  const [slides, setSlides] = useState<SlideImage[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  // Effect 1: build slides once on mount.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const images = container.querySelectorAll<HTMLImageElement>('img')

    setSlides(
      Array.from(images).map((img) => {
        const caption = getCaption(img)
        return {
          src: img.getAttribute('src') ?? img.src,
          alt: img.alt,
          title: caption || undefined
        }
      })
    )
  }, [])

  // Effect 2: attach click listeners after slides are known (and after the
  // re-render from setSlides has committed, so the DOM nodes are stable).
  useEffect(() => {
    if (slides.length === 0) return

    const container = containerRef.current
    if (!container) return

    const images = container.querySelectorAll<HTMLImageElement>('img')
    const controller = new AbortController()

    images.forEach((img, i) => {
      img.addEventListener('click', () => setLightboxIndex(i), {
        signal: controller.signal
      })
    })

    return () => {
      controller.abort()
    }
  }, [slides.length])

  return {
    containerRef,
    slides,
    lightboxIndex,
    closeLightbox: () => setLightboxIndex(-1)
  }
}
