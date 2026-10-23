'use client'

import { useSyncExternalStore } from 'react'

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

  function toggle() {
    setSoundEnabled(!on)
    playSound('sound-on')
  }

  return (
    <button
      aria-pressed={on}
      className={styles.toggle}
      data-boop="waves"
      onClick={toggle}
      type="button"
    >
      {on ? <VolumeIcon /> : <VolumeOffIcon />}
      <span className="visually-hidden">Sound effects</span>
    </button>
  )
}
