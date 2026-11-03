'use client'

import { useEffect, useRef, useState } from 'react'

import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons'

import { playSound } from './sounds'
import styles from './strip-buttons.module.css'

/** A step scrolls most of the visible width, so the card at the edge stays in view. */
const STEP = 0.8

/**
 * Left and right buttons over the edges of a row that scrolls sideways. Each
 * shows only while there's more to scroll its way, so the left one appears
 * after the first step. Renders nothing until it has measured the row, so
 * readers without JavaScript see no buttons.
 *
 * @param controls - The id of the scrolling row.
 * @param label - What the row holds, for the button names ("roles", "photos").
 */
export function StripButtons({ controls, label }: { controls: string; label: string }) {
  const [edges, setEdges] = useState<{ start: boolean; end: boolean } | null>(null)
  const left = useRef<HTMLButtonElement>(null)
  const right = useRef<HTMLButtonElement>(null)
  const last = useRef<-1 | 1 | null>(null)

  useEffect(() => {
    const strip = document.getElementById(controls)
    if (!strip) return
    // A pixel of slack, since fractional scroll positions never quite reach the end.
    const measure = () =>
      setEdges({
        start: strip.scrollLeft <= 1,
        end: strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 1,
      })
    // The observer measures once on start, then whenever the row's width changes.
    const observer = new ResizeObserver(measure)
    observer.observe(strip)
    strip.addEventListener('scroll', measure, { passive: true })
    return () => {
      observer.disconnect()
      strip.removeEventListener('scroll', measure)
    }
  }, [controls])

  // When the button just used hides at an end, focus moves to the other one instead of the page.
  useEffect(() => {
    if (!edges || document.activeElement !== document.body) return
    const other =
      (last.current === 1 && edges.end && left.current) ||
      (last.current === -1 && edges.start && right.current)
    if (!other) return
    last.current = null
    other.focus({ preventScroll: true })
  }, [edges])

  if (!edges) return null

  function scroll(direction: -1 | 1) {
    const strip = document.getElementById(controls)
    if (!strip) return
    last.current = direction
    playSound('step')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    strip.scrollBy({
      left: direction * strip.clientWidth * STEP,
      behavior: still ? 'auto' : 'smooth',
    })
  }

  return (
    <>
      {edges.start ? null : (
        <button
          aria-controls={controls}
          aria-label={`Scroll ${label} left`}
          className={`${styles.button} ${styles.left}`}
          onClick={() => scroll(-1)}
          ref={left}
          type="button"
        >
          <ArrowLeftIcon size={20} />
        </button>
      )}
      {edges.end ? null : (
        <button
          aria-controls={controls}
          aria-label={`Scroll ${label} right`}
          className={`${styles.button} ${styles.right}`}
          onClick={() => scroll(1)}
          ref={right}
          type="button"
        >
          <ArrowRightIcon size={20} />
        </button>
      )}
    </>
  )
}
