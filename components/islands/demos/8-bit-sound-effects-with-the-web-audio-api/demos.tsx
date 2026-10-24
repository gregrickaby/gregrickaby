'use client'

import { useState } from 'react'

import { Caption, Controls, DemoButton, Slider } from '@/components/islands/demo-kit/controls'
import { Plot } from '@/components/islands/demo-kit/plot'
import { playNotes, SOUNDS, type Note } from '@/components/islands/sounds'

import styles from './demos.module.css'

const PLOT_SAMPLES = 240

const MAX_HARMONICS = 15

/**
 * Two cycles of a square wave's Fourier series, cut off after `harmonics`
 * odd harmonics. More harmonics, sharper corners.
 */
export function partialSquareWave(harmonics: number): number[] {
  return Array.from({ length: PLOT_SAMPLES }, (_, i) => {
    const x = (i / (PLOT_SAMPLES - 1)) * 4 * Math.PI
    let sum = 0
    for (let n = 1; n < harmonics * 2; n += 2) sum += Math.sin(n * x) / n
    return (4 / Math.PI) * sum * 0.8
  })
}

function describeHarmonics(harmonics: number): string {
  if (harmonics === 1) return 'One harmonic is a plain sine wave: just the note itself.'
  if (harmonics === MAX_HARMONICS)
    return 'Close to square. A true square wave never stops adding them.'
  return `The note plus ${harmonics - 1} odd harmonics, up to ${harmonics * 2 - 1} times its pitch.`
}

/** Adds a square wave's odd harmonics one at a time, drawn and playable. */
export function HarmonicsDemo() {
  const [harmonics, setHarmonics] = useState(1)
  return (
    <>
      <Plot
        label={`A wave built from ${harmonics} harmonics`}
        values={partialSquareWave(harmonics)}
      />
      <Controls>
        <Slider
          label="Harmonics"
          max={MAX_HARMONICS}
          min={1}
          onChange={setHarmonics}
          value={harmonics}
        />
        <DemoButton onClick={() => playNotes([[220, 0.8]], { harmonics })}>Play</DemoButton>
      </Controls>
      <Caption>{describeHarmonics(harmonics)}</Caption>
    </>
  )
}

const FADE_NOTE: Note[] = [[330, 0.4]]
const STOP_AT = 0.79

/** A sine wave that stops mid-swing at `STOP_AT`, with or without fading first. */
export function stoppedSine(fade: boolean): number[] {
  return Array.from({ length: PLOT_SAMPLES }, (_, i) => {
    const t = i / (PLOT_SAMPLES - 1)
    if (t > STOP_AT) return 0
    const level = fade ? 0.001 ** (t / STOP_AT) : 1
    return Math.sin(t * 12 * Math.PI) * level * 0.8
  })
}

/** The same note twice: once fading out, once cut off with a click. */
export function FadeDemo() {
  return (
    <div className={styles.pair}>
      <div className={styles.panel}>
        <Plot label="A sine wave that fades to silence" values={stoppedSine(true)} />
        <Controls>
          <DemoButton onClick={() => playNotes(FADE_NOTE, { harmonics: 1 })}>
            Play with fade
          </DemoButton>
        </Controls>
      </div>
      <div className={styles.panel}>
        <Plot label="A sine wave that stops mid-swing" values={stoppedSine(false)} />
        <Controls>
          <DemoButton onClick={() => playNotes(FADE_NOTE, { fade: false, harmonics: 1 })}>
            Play without fade
          </DemoButton>
        </Controls>
      </div>
    </div>
  )
}

const MAX_GRIT = 32
const NOISE_SAMPLES = 128

/**
 * Repeatable noise for the picture, so the server and browser draw the same
 * thing. The sound itself uses `Math.random()`.
 */
function pictureNoise(): number[] {
  let seed = 7
  return Array.from({ length: NOISE_SAMPLES }, () => {
    seed = (seed * 16807) % 2147483647
    return (seed / 2147483647) * 2 - 1
  })
}

const PICTURE_NOISE = pictureNoise()

/** The picture's noise with each value held for `grit` samples. */
export function heldNoise(grit: number): number[] {
  let held = 0
  return PICTURE_NOISE.map((value, i) => (held = i % grit === 0 ? value : held))
}

/** White noise with a grit slider: how many samples each random value lasts. */
export function NoiseDemo() {
  const [grit, setGrit] = useState(1)
  return (
    <>
      <Plot
        label={`Noise with each value held for ${grit} samples`}
        steps
        values={heldNoise(grit).map((value) => value * 0.9)}
      />
      <Controls>
        <Slider label="Grit" max={MAX_GRIT} min={1} onChange={setGrit} value={grit} />
        <DemoButton onClick={() => playNotes([['noise', 0.6]], { grit })}>Play</DemoButton>
      </Controls>
      <Caption>
        {grit === 1
          ? 'A new random value every sample: smooth, fizzy static.'
          : `Each random value lasts ${grit} samples. At 48 kHz, that is ${Math.round(48000 / grit).toLocaleString('en-US')} changes a second.`}
      </Caption>
    </>
  )
}

type NoteKind = 'tone' | 'noise' | 'rest'

/** One editable row. Pitch and length are strings so a half-typed number survives. */
interface NoteRow {
  id: number
  kind: NoteKind
  pitch: string
  seconds: string
}

const PRESETS = {
  Coin: SOUNDS.coin,
  'Sound on': SOUNDS['sound-on'],
  Shutter: SOUNDS.shutter,
  Fanfare: SOUNDS.fanfare,
} satisfies Record<string, readonly Note[]>

const MAX_ROWS = 24
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function clamp(value: string, min: number, max: number, fallback: number): number {
  const number = Number.parseFloat(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

function toRows(notes: readonly Note[]): NoteRow[] {
  return notes.map(([pitch, seconds], id) =>
    typeof pitch === 'number'
      ? { id, kind: 'tone', pitch: String(pitch), seconds: String(seconds) }
      : { id, kind: pitch, pitch: '440', seconds: String(seconds) },
  )
}

/** The rows as notes, with pitches held to 20 to 5000 Hz and lengths to 0.01 to 2 seconds. */
export function toNotes(rows: readonly NoteRow[]): Note[] {
  return rows.map((row) => {
    const seconds = clamp(row.seconds, 0.01, 2, 0.1)
    return [row.kind === 'tone' ? clamp(row.pitch, 20, 5000, 440) : row.kind, seconds]
  })
}

/** A pitch's nearest note in scientific pitch notation, such as `B5` for 988 Hz. */
export function noteName(hz: number): string {
  const midi = Math.round(12 * Math.log2(hz / 440)) + 69
  // midi % 12 always indexes a name; the array type allows undefined.
  /* v8 ignore next */
  return `${NOTE_NAMES[midi % 12] ?? ''}${Math.floor(midi / 12) - 1}`
}

/** Notes written the way `sounds.ts` writes them. */
export function formatNotes(notes: readonly Note[]): string {
  const lines = notes.map(([pitch, seconds]) => {
    const value = typeof pitch === 'number' ? pitch : `'${pitch}'`
    return `  [${value}, ${seconds}],`
  })
  return ['[', ...lines, ']'].join('\n')
}

/**
 * A note-by-note editor for the same format the site's sounds use. Start from
 * a preset, change pitches and lengths, and play the result.
 */
export function NotesDemo() {
  const [rows, setRows] = useState(() => toRows(PRESETS.Coin))
  const notes = toNotes(rows)

  function update(id: number, change: Partial<NoteRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...change } : row)))
  }

  function add() {
    setRows((current) => [
      ...current,
      {
        id: Math.max(-1, ...current.map((row) => row.id)) + 1,
        kind: 'tone',
        pitch: '880',
        seconds: '0.1',
      },
    ])
  }

  return (
    <>
      <Controls label="Start from">
        {Object.entries(PRESETS).map(([name, preset]) => (
          <DemoButton key={name} onClick={() => setRows(toRows(preset))} variant="secondary">
            {name}
          </DemoButton>
        ))}
      </Controls>
      <ol className={styles.rows}>
        {rows.map((row, i) => (
          <li className={styles.row} key={row.id}>
            <select
              aria-label={`Note ${i + 1} type`}
              onChange={(event) => update(row.id, { kind: event.target.value as NoteKind })}
              value={row.kind}
            >
              <option value="tone">Tone</option>
              <option value="noise">Noise</option>
              <option value="rest">Rest</option>
            </select>
            <input
              aria-label={`Note ${i + 1} pitch in hertz`}
              disabled={row.kind !== 'tone'}
              inputMode="numeric"
              onChange={(event) => update(row.id, { pitch: event.target.value })}
              type="number"
              value={row.kind === 'tone' ? row.pitch : ''}
            />
            <span aria-hidden="true" className={styles.noteName}>
              {row.kind === 'tone' ? noteName(clamp(row.pitch, 20, 5000, 440)) : ''}
            </span>
            <input
              aria-label={`Note ${i + 1} length in seconds`}
              inputMode="decimal"
              onChange={(event) => update(row.id, { seconds: event.target.value })}
              step={0.01}
              type="number"
              value={row.seconds}
            />
            <button
              aria-label={`Remove note ${i + 1}`}
              className={styles.remove}
              onClick={() => setRows((current) => current.filter((other) => other.id !== row.id))}
              type="button"
            >
              &times;
            </button>
          </li>
        ))}
      </ol>
      <Controls>
        <DemoButton disabled={rows.length >= MAX_ROWS} onClick={add} variant="secondary">
          Add a note
        </DemoButton>
        <DemoButton disabled={rows.length === 0} onClick={() => playNotes(notes)}>
          Play
        </DemoButton>
      </Controls>
      <pre className={styles.code}>
        <code>{formatNotes(notes)}</code>
      </pre>
    </>
  )
}
