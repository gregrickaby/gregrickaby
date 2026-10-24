'use client'

import { useSyncExternalStore, type MouseEvent } from 'react'

import { VolumeIcon, VolumeOffIcon } from '@/components/icons'

import styles from './sound-toggle.module.css'
import { playSound, setSoundEnabled, soundEnabled, subscribeSound } from './sounds'

/**
 * Turns the 8-bit sound effects on and off. Off by default, and the server
 * always renders it off; the saved choice applies after hydration. CSS hides
 * it without JavaScript, since sounds need scripts.
 */
export function SoundToggle() {
  const on = useSyncExternalStore(subscribeSound, soundEnabled, () => false)

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    setSoundEnabled(!on)
    playSound('sound-on')
    // Floats notes up when sound turns on. Cleared when they finish.
    if (!on) event.currentTarget.dataset.played = ''
  }

  return (
    <button
      aria-pressed={on}
      className={styles.toggle}
      data-boop="waves"
      onAnimationEnd={(event) => {
        // The icon's hover boop ends on its paths; only the notes end on the button.
        if (event.target === event.currentTarget) delete event.currentTarget.dataset.played
      }}
      onClick={toggle}
      type="button"
    >
      {on ? <VolumeIcon /> : <VolumeOffIcon />}
      <span className="visually-hidden">Sound effects</span>
    </button>
  )
}
