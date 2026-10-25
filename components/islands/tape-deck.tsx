'use client'

import { useEffect, useRef, useState } from 'react'

import { Caption, Controls, DemoButton, Slider } from '@/components/islands/demo-kit/controls'
import { claimSpeakers, releaseSpeakers } from '@/components/islands/demo-kit/speakers'
import { createFollower, type Follower } from '@/components/islands/follow'
import { lofiSettings, type StartTape, type Tape, type TapeTrack } from '@/components/islands/tape'

import styles from './tape-deck.module.css'

/** Seconds as `m:ss`, like a tape counter. */
export function formatTime(seconds: number): string {
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

/** What the lo-fi knob is doing, in numbers. */
export function describeLofi(percent: number): string {
  if (percent === 0) return 'Clean signal. Slide right to wear out the tape.'
  const { crackle, cutoff, wobble } = lofiSettings(percent / 100)
  const filter = cutoff >= 1000 ? `${(cutoff / 1000).toFixed(1)} kHz` : `${cutoff} Hz`
  return `Lowpass at ${filter}, ${wobble} cents of wobble, crackle at ${Math.round((crackle / 0.12) * 100)}%.`
}

/**
 * The track after `index` in a playlist of `count`: the next one in order, or
 * with shuffle on, any other track, so the same one never plays twice in a row.
 */
export function nextTrack(
  index: number,
  count: number,
  shuffle: boolean,
  random = Math.random,
): number {
  if (!shuffle) return (index + 1) % count
  const pick = Math.floor(random() * (count - 1))
  return pick >= index ? pick + 1 : pick
}

/** How long a track lasts, ignoring swing, which evens out over each pair of steps. */
function trackSeconds(track: TapeTrack): number {
  return track.bars * 16 * (60 / track.bpm / 4)
}

/** A sixteenth note's average length in a track. */
function stepSeconds(track: TapeTrack): number {
  return 60 / track.bpm / 4
}

/**
 * A cassette deck that plays a playlist of tracks made on the spot. The reels
 * spin, the tape moves from one spool to the other as the track plays, one
 * knob wears the sound out, and the deck moves on to the next track when one
 * ends. `shuffle` adds a button that plays the tracks in random order.
 */
export function TapeDeck<T extends TapeTrack>({
  shuffle: canShuffle = false,
  startTape,
  tracks,
}: {
  shuffle?: boolean
  startTape: StartTape<T>
  tracks: readonly T[]
}) {
  const deck = useRef<{ tape: Tape; follower: Follower } | undefined>(undefined)
  const lofiRef = useRef(60)
  const shuffleRef = useRef(false)
  const [index, setIndex] = useState(0)
  const [lofi, setLofi] = useState(60)
  const [shuffle, setShuffle] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!playing) return
    let frame = requestAnimationFrame(follow)
    function follow() {
      const current = deck.current
      const next = current?.follower.take(current.tape.now())
      if (next !== undefined) setStep(next)
      frame = requestAnimationFrame(follow)
    }
    return () => cancelAnimationFrame(frame)
  }, [playing])

  useEffect(() => {
    const decks = deck
    return () => {
      decks.current?.tape.stop()
      releaseSpeakers(decks)
    }
  }, [])

  /** A track by its place in the playlist, wrapping around at the end. */
  function trackAt(at: number): T {
    // The modulo always lands on a track; the array type allows undefined.
    /* v8 ignore next */
    return tracks[at % tracks.length] ?? (tracks[0] as T)
  }

  function load(next: number) {
    claimSpeakers(deck, stop)
    deck.current?.tape.stop()
    const follower = createFollower()
    const tape = startTape(trackAt(next), lofiRef.current / 100, follower.push, () =>
      load(nextTrack(next, tracks.length, shuffleRef.current)),
    )
    deck.current = tape && { tape, follower }
    setIndex(next)
    setStep(0)
    setPlaying(Boolean(tape))
  }

  function stop() {
    deck.current?.tape.stop()
    deck.current = undefined
    releaseSpeakers(deck)
    setPlaying(false)
  }

  const track = trackAt(index)
  const progress = playing ? Math.min(1, step / (track.bars * 16)) : 0
  return (
    <>
      <div className={styles.deck} data-playing={playing || undefined}>
        <svg aria-hidden="true" className={styles.cassette} viewBox="0 0 200 128">
          <rect className={styles.shell} height="124" rx="10" width="196" x="2" y="2" />
          <rect className={styles.sticker} height="44" rx="4" width="172" x="14" y="10" />
          <rect className={styles.window} height="36" rx="5" width="104" x="48" y="62" />
          <circle className={styles.pack} cx="72" cy="80" r={7 + 9 * (1 - progress)} />
          <circle className={styles.pack} cx="128" cy="80" r={7 + 9 * progress} />
          {[72, 128].map((cx) => (
            <g className={styles.reel} key={cx}>
              <circle cx={cx} cy="80" r="6" />
              <path d={`M${cx} 74.5V77M${cx - 4.8} 82.8l2.2-1.3M${cx + 4.8} 82.8l-2.2-1.3`} />
            </g>
          ))}
          <path className={styles.edge} d="M42 126 52 106H148L158 126" />
          {[
            [10, 10],
            [190, 10],
            [10, 118],
            [190, 118],
          ].map(([cx, cy]) => (
            <circle className={styles.screw} cx={cx} cy={cy} key={`${cx}-${cy}`} r="2.5" />
          ))}
        </svg>
        <p className={styles.label}>
          <span className={styles.side}>Side A</span>
          {track.title}
        </p>
      </div>
      <p aria-live="off" className={styles.counter}>
        {formatTime(playing ? step * stepSeconds(track) : 0)} / {formatTime(trackSeconds(track))}
      </p>
      <ol className={styles.tracks}>
        {tracks.map((item, i) => (
          <li key={item.title}>
            <button
              aria-current={i === index ? 'true' : undefined}
              className={styles.track}
              onClick={() => load(i)}
              type="button"
            >
              <span>{item.title}</span>
              <span className={styles.length}>{formatTime(trackSeconds(item))}</span>
            </button>
          </li>
        ))}
      </ol>
      <Controls>
        <DemoButton onClick={playing ? stop : () => load(index)} playing={playing} />
        <DemoButton
          onClick={() => load(nextTrack(index, tracks.length, shuffle))}
          variant="secondary"
        >
          Next track
        </DemoButton>
        {canShuffle ? (
          <DemoButton
            aria-pressed={shuffle}
            onClick={() => {
              shuffleRef.current = !shuffle
              setShuffle(!shuffle)
            }}
            variant="secondary"
          >
            Shuffle
          </DemoButton>
        ) : null}
        <Slider
          label="Lo-fi"
          max={100}
          min={0}
          onChange={(value) => {
            lofiRef.current = value
            deck.current?.tape.setLofi(value / 100)
            setLofi(value)
          }}
          value={lofi}
        />
      </Controls>
      <div className={styles.caption}>
        <Caption>{describeLofi(lofi)}</Caption>
      </div>
    </>
  )
}
