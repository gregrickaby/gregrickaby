'use client'

import { useEffect, useRef, useState } from 'react'

import { PlayIcon } from '@/components/islands/demo-kit/controls'

import { DIAL_NUMBER, FANFARE, startTransmission, type HangUp, type Phase } from './subspace'
import styles from './subspace-player.module.css'

/** Where the radio is: a transmission phase, hung up early, or unable to play. */
type Status = Phase | 'hungUp' | 'silent'

const STATUS: Record<Status, string> = {
  idle: 'Subspace channel open. Standing by.',
  hungUp: 'NO CARRIER',
  silent: 'This browser has no Web Audio. Subspace is quiet.',
  dialing: `ATDT ${DIAL_NUMBER}`,
  handshake: 'Carrier detected. Negotiating with Starfleet Command.',
  playing: `Connected at 28.8 Kbps. Now playing "${FANFARE.title}".`,
}

/**
 * The LCARS console stuck to the bottom of `/geocities`. Browsers block
 * autoplay, so the engage button pulses until the visitor presses it. CSS
 * hides the console without JavaScript, since the sound needs scripts.
 */
export function SubspacePlayer() {
  const hangUp = useRef<HangUp | undefined>(undefined)
  const [status, setStatus] = useState<Status>('idle')
  const [engaged, setEngaged] = useState(false)

  // Leaving the page drops the call without the busy signal.
  useEffect(() => () => hangUp.current?.({ quietly: true }), [])

  function toggle() {
    if (hangUp.current) {
      hangUp.current()
      hangUp.current = undefined
      setStatus('hungUp')
      return
    }
    setEngaged(true)
    hangUp.current = startTransmission((next) => {
      setStatus(next)
      if (next === 'idle') hangUp.current = undefined
    })
    if (!hangUp.current) setStatus('silent')
  }

  const active = status === 'dialing' || status === 'handshake' || status === 'playing'
  return (
    <aside
      aria-label="Subspace radio"
      className={styles.player}
      data-engaged={engaged || undefined}
    >
      <span aria-hidden="true" className={styles.cap} />
      <p className={styles.label}>Subspace comm</p>
      <button
        className={styles.engage}
        data-active={active || undefined}
        onClick={toggle}
        type="button"
      >
        {active ? (
          <span aria-hidden="true" className={styles.bars}>
            <span />
            <span />
            <span />
          </span>
        ) : (
          <PlayIcon className={styles.icon} />
        )}
        {active ? 'Hang up' : 'Engage'}
      </button>
      <p aria-live="polite" className={styles.status}>
        {STATUS[status]}
      </p>
      <span aria-hidden="true" className={styles.lights} data-active={active || undefined}>
        <span />
        <span />
        <span />
      </span>
    </aside>
  )
}
