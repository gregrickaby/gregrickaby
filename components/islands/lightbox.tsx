'use client'

import {
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
} from 'react'

import { ArrowLeftIcon, ArrowRightIcon, CloseIcon, DownloadIcon } from '@/components/icons'

import styles from './lightbox.module.css'
import { playSound } from './sounds'

/** One image in the viewer, read from the page's `[data-lightbox]` elements. */
export interface Slide {
  src: string
  alt: string
  caption?: string
  details?: string
  /** The original file, offered as a download. */
  download?: string
}

/**
 * Reads a slide from a trigger: an `<img data-lightbox>` in post HTML, or an
 * `<a data-lightbox>` around a gallery photo.
 */
export function toSlide(el: HTMLElement): Slide {
  if (el instanceof HTMLImageElement) {
    const figcaption = el.closest('figure')?.querySelector('figcaption')?.textContent?.trim()
    return {
      src: el.dataset.full ?? (el.currentSrc || el.src),
      alt: el.alt,
      caption: figcaption || el.title || el.alt || undefined,
    }
  }
  const img = el.querySelector('img')
  return {
    src: el.dataset.full ?? el.getAttribute('href') ?? '',
    alt: img?.alt ?? '',
    caption: el.dataset.caption,
    details: el.dataset.details,
    download: el.getAttribute('href') ?? undefined,
  }
}

const SWIPE_DISTANCE = 50

/**
 * Opens any `[data-lightbox]` element inside it in a full-screen `<dialog>`,
 * with arrow keys, swipes, and buttons to move between images. The dialog
 * closes on Escape or a click outside the image. Without JavaScript, gallery
 * links open the original file and post images stay as they are.
 */
export function Lightbox({ children, className }: { children: ReactNode; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const touchX = useRef<number | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [index, setIndex] = useState(0)

  function open(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    const trigger = (event.target as Element).closest<HTMLElement>('[data-lightbox]')
    if (!trigger || dialog.current?.contains(trigger)) return
    event.preventDefault()
    const triggers = [...event.currentTarget.querySelectorAll<HTMLElement>('[data-lightbox]')]
    setSlides(triggers.map(toSlide))
    setIndex(Math.max(0, triggers.indexOf(trigger)))
    dialog.current?.showModal()
    playSound('open')
  }

  function step(delta: number) {
    playSound('step')
    setIndex((i) => (i + delta + slides.length) % slides.length)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'ArrowLeft') step(-1)
    if (event.key === 'ArrowRight') step(1)
  }

  function onBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) dialog.current?.close()
  }

  function onTouchStart(event: TouchEvent<HTMLDialogElement>) {
    touchX.current = event.touches[0]?.clientX ?? null
  }

  function onTouchEnd(event: TouchEvent<HTMLDialogElement>) {
    const start = touchX.current
    const end = event.changedTouches[0]?.clientX
    touchX.current = null
    if (start === null || end === undefined || Math.abs(end - start) < SWIPE_DISTANCE) return
    step(end < start ? 1 : -1)
  }

  const slide = slides[index]
  const many = slides.length > 1

  return (
    <div className={className} onClick={open}>
      {children}
      <dialog
        aria-label="Image viewer"
        className={styles.dialog}
        onClick={onBackdrop}
        onClose={() => playSound('close')}
        onKeyDown={onKeyDown}
        onTouchEnd={onTouchEnd}
        onTouchStart={onTouchStart}
        ref={dialog}
      >
        {slide ? (
          <figure className={styles.figure}>
            {/* Already an optimized URL (or an HDR original), so next/image would only re-wrap it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={slide.alt} className={styles.image} key={slide.src} src={slide.src} />
            <figcaption className={styles.caption}>
              {slide.caption ? <span className={styles.title}>{slide.caption}</span> : null}
              {slide.details ? <span>{slide.details}</span> : null}
              {many ? (
                <span>
                  {index + 1} of {slides.length}
                </span>
              ) : null}
            </figcaption>
          </figure>
        ) : null}
        <div className={styles.controls}>
          {slide?.download ? (
            <a
              aria-label="Download original"
              className={styles.control}
              data-boop="drop"
              download
              href={slide.download}
            >
              <DownloadIcon />
            </a>
          ) : null}
          <button
            aria-label="Close"
            className={styles.control}
            data-boop="spin"
            onClick={() => dialog.current?.close()}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        {many ? (
          <>
            <button
              aria-label="Previous image"
              className={`${styles.control} ${styles.prev}`}
              data-boop="nudge-left"
              onClick={() => step(-1)}
              type="button"
            >
              <ArrowLeftIcon />
            </button>
            <button
              aria-label="Next image"
              className={`${styles.control} ${styles.next}`}
              data-boop="nudge-right"
              onClick={() => step(1)}
              type="button"
            >
              <ArrowRightIcon />
            </button>
          </>
        ) : null}
      </dialog>
    </div>
  )
}
