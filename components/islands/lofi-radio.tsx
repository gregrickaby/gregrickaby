'use client'

import { TapeDeck } from '@/components/islands/tape-deck'

import { startTape, TRACKS } from './lofi'
import styles from './lofi-radio.module.css'

/**
 * The 404 page's cassette deck: lo-fi tracks made on the spot, in order or
 * shuffled. It plays only with JavaScript, so without it the frame shows the
 * cassette and says so.
 */
export function LofiRadio() {
  return (
    <section aria-label="Lo-fi radio" className={styles.radio}>
      <TapeDeck shuffle startTape={startTape} tracks={TRACKS} />
      <p className={styles.noscript}>Turn on JavaScript to play the tapes.</p>
    </section>
  )
}
