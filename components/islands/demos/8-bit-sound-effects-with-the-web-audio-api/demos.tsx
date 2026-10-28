'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'

import { Caption, Controls, DemoButton, Slider } from '@/components/islands/demo-kit/controls'
import { usePlayback } from '@/components/islands/demo-kit/playback'
import { Plot } from '@/components/islands/demo-kit/plot'
import { claimSpeakers, releaseSpeakers } from '@/components/islands/demo-kit/speakers'
import { startTone, type Note } from '@/components/islands/sounds'

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
  const { play, playing, stop } = usePlayback()
  return (
    <>
      <Plot
        label={`A wave built from ${harmonics} harmonics`}
        playing={playing}
        values={partialSquareWave(harmonics)}
      />
      <Controls>
        <DemoButton
          onClick={playing ? stop : () => play([[220, 0.8]], { harmonics })}
          playing={playing}
        />
        <Slider
          label="Harmonics"
          max={MAX_HARMONICS}
          min={1}
          onChange={setHarmonics}
          value={harmonics}
        />
      </Controls>
      <Caption>{describeHarmonics(harmonics)}</Caption>
    </>
  )
}

/** What the console demo says before it runs and while it plays. */
export function describeRun(seconds: number | null): string {
  if (seconds === null)
    return "The snippet's defaults: a 440 Hz sine wave at full volume. This one plays at 5%."
  const elapsed = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`
  if (seconds < 30) return `Playing for ${elapsed}. It won't stop on its own.`
  return `${elapsed} and counting. Closing the tab works too.`
}

const PANIC_AT = 10

/** Four cycles of a sine wave, the same scale as the square waves below: A4. */
export function sineWave(): number[] {
  return Array.from(
    { length: PLOT_SAMPLES },
    (_, i) => Math.sin((i / (PLOT_SAMPLES - 1)) * 4 * 2 * Math.PI) * 0.8,
  )
}

/**
 * The post's first snippet, run for the reader: a tone with no end, its wave,
 * a timer, and a button to stop it that starts to shake after ten seconds.
 * Leaving the page stops it too.
 */
export function ConsoleDemo() {
  const stop = useRef<(() => void) | undefined>(undefined)
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setSeconds((current) => current + 1), 1000)
    return () => {
      clearInterval(timer)
      stop.current?.()
      stop.current = undefined
      releaseSpeakers(stop)
    }
  }, [running])

  function run() {
    const tone = startTone(440, { harmonics: 1 })
    if (!tone) return
    claimSpeakers(stop, () => setRunning(false))
    stop.current = tone
    setSeconds(0)
    setRunning(true)
  }

  return (
    <>
      <Plot label="A sine wave at 440 Hz" playing={running} values={sineWave()} />
      <Controls>
        <DemoButton
          className={running && seconds >= PANIC_AT ? styles.panic : undefined}
          onClick={running ? () => setRunning(false) : run}
          playing={running}
        />
      </Controls>
      <Caption>{describeRun(running ? seconds : null)}</Caption>
    </>
  )
}

/** The post's formula: 440 Hz times the twelfth root of two per semitone. */
export function frequency(semitones: number): number {
  return 440 * 2 ** (semitones / 12)
}

/** A square wave drawn with more cycles as the pitch climbs: four at A4. */
export function squareAt(hz: number): number[] {
  const cycles = (4 * hz) / 440
  return Array.from({ length: PLOT_SAMPLES }, (_, i) =>
    Math.sin((i / (PLOT_SAMPLES - 1)) * cycles * 2 * Math.PI) >= 0 ? 0.8 : -0.8,
  )
}

const OCTAVES: Record<number, string> = {
  [-12]: 'One octave down: exactly half of A4.',
  0: 'The note orchestras tune to.',
  12: 'One octave up: exactly double A4.',
  24: 'Two octaves up: four times A4.',
}

/** A semitone count as hertz and a note name, plus a word on whole octaves. */
export function describePitch(semitones: number): string {
  const hz = frequency(semitones)
  return `${Number(hz.toFixed(2))} Hz, ${noteName(hz)}. ${OCTAVES[semitones] ?? ''}`.trim()
}

/** A semitone slider that runs the formula, draws the wave, and plays the note. */
export function ScaleDemo() {
  const [semitones, setSemitones] = useState(3)
  const { play, playing, stop } = usePlayback()
  const hz = frequency(semitones)
  return (
    <>
      <Plot
        label={`A square wave at ${Number(hz.toFixed(2))} Hz`}
        playing={playing}
        values={squareAt(hz)}
      />
      <Controls>
        <DemoButton onClick={playing ? stop : () => play([[hz, 0.4]])} playing={playing} />
        <Slider label="Semitones" max={24} min={-12} onChange={setSemitones} value={semitones} />
      </Controls>
      <Caption>
        <code>frequency({semitones})</code> is {describePitch(semitones)}
      </Caption>
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
  const faded = usePlayback()
  const cut = usePlayback()
  return (
    <div className={styles.pair}>
      <div aria-label="With fade" className={styles.panel} role="group">
        <Plot
          label="A sine wave that fades to silence"
          playing={faded.playing}
          values={stoppedSine(true)}
        />
        <Controls>
          <DemoButton
            onClick={faded.playing ? faded.stop : () => faded.play(FADE_NOTE, { harmonics: 1 })}
            playing={faded.playing}
          />
          <Caption>With fade</Caption>
        </Controls>
      </div>
      <div aria-label="Without fade" className={styles.panel} role="group">
        <Plot
          label="A sine wave that stops mid-swing"
          playing={cut.playing}
          values={stoppedSine(false)}
        />
        <Controls>
          <DemoButton
            onClick={
              cut.playing ? cut.stop : () => cut.play(FADE_NOTE, { fade: false, harmonics: 1 })
            }
            playing={cut.playing}
          />
          <Caption>Without fade</Caption>
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
  const { play, playing, stop } = usePlayback()
  return (
    <>
      <Plot
        label={`Noise with each value held for ${grit} samples`}
        playing={playing}
        steps
        values={heldNoise(grit).map((value) => value * 0.9)}
      />
      <Controls>
        <DemoButton
          onClick={playing ? stop : () => play([['noise', 0.6]], { grit })}
          playing={playing}
        />
        <Slider label="Grit" max={MAX_GRIT} min={1} onChange={setGrit} value={grit} />
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

/** Original sounds in the NES style, written for this post. */
const PRESETS = {
  Jump: [
    [330, 0.02],
    [440, 0.02],
    [587, 0.02],
    [784, 0.06],
  ],
  Laser: [
    [1568, 0.03],
    [1319, 0.03],
    [1047, 0.03],
    [784, 0.03],
    [523, 0.06],
  ],
  'Power up': [
    [523, 0.05],
    [659, 0.05],
    [784, 0.05],
    [1047, 0.05],
    [784, 0.05],
    [1319, 0.3],
  ],
  Hurt: [
    [220, 0.05],
    [147, 0.05],
    [220, 0.05],
    [147, 0.12],
  ],
  Explosion: [
    ['noise', 0.08],
    ['rest', 0.02],
    ['noise', 0.4],
  ],
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
 * The pitch one semitone up or down from `hz`, in whole hertz. A pitch on a
 * note moves to the next note; one between notes lands on the nearest note
 * in that direction.
 */
export function stepNote(hz: number, direction: 1 | -1): number {
  const midi = 12 * Math.log2(hz / 440) + 69
  const nearest = Math.round(midi)
  const from =
    Math.abs(midi - nearest) < 0.1 ? nearest : direction > 0 ? Math.floor(midi) : Math.ceil(midi)
  return Math.min(5000, Math.max(20, Math.round(440 * 2 ** ((from + direction - 69) / 12))))
}

const ROLL_WIDTH = 300
const ROLL_HEIGHT = 100
const BLOCK = 8
/** C3 to C8, as MIDI note numbers: the range the roll draws. */
const ROLL_LOW = 48
const ROLL_HIGH = 108

interface RollBlock {
  kind: 'tone' | 'noise'
  width: number
  x: number
  y: number
}

/**
 * Notes as blocks on a piano roll: across by time, up by pitch (one step per
 * semitone), with noise along the bottom. Rests are gaps, so they're null.
 */
export function rollBlocks(notes: readonly Note[]): (RollBlock | null)[] {
  const total = notes.reduce((sum, [, seconds]) => sum + seconds, 0)
  let start = 0
  return notes.map(([pitch, seconds]) => {
    const x = (start / total) * ROLL_WIDTH
    const width = Math.max(1, (seconds / total) * ROLL_WIDTH - 1)
    start += seconds
    if (pitch === 'rest') return null
    if (pitch === 'noise') return { kind: 'noise', width, x, y: ROLL_HEIGHT - BLOCK }
    const midi = Math.min(
      ROLL_HIGH,
      Math.max(ROLL_LOW, Math.round(12 * Math.log2(pitch / 440) + 69)),
    )
    const y = (1 - (midi - ROLL_LOW) / (ROLL_HIGH - ROLL_LOW)) * (ROLL_HEIGHT - BLOCK * 2)
    return { kind: 'tone', width, x, y }
  })
}

/** The notes as pixel blocks, with the one sounding now lit up and hopping. */
function PianoRoll({ active, notes }: { active: number; notes: readonly Note[] }) {
  return (
    <svg
      aria-label={`A piano roll of ${notes.length} notes`}
      className={styles.roll}
      data-playing={active === -1 ? undefined : true}
      preserveAspectRatio="none"
      role="img"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${ROLL_WIDTH} ${ROLL_HEIGHT}`}
    >
      {rollBlocks(notes).map((block, i) =>
        block ? (
          <rect
            className={block.kind === 'noise' ? styles.noiseBlock : styles.block}
            data-active={active === i || undefined}
            height={BLOCK}
            key={i}
            width={block.width.toFixed(1)}
            x={block.x.toFixed(1)}
            y={block.y.toFixed(1)}
          />
        ) : null,
      )}
    </svg>
  )
}

/** True when the field's arrows or arrow keys changed it, not typing or pasting. */
function stepped(event: ChangeEvent<HTMLInputElement>): boolean {
  return !(event.nativeEvent as InputEvent).inputType
}

/**
 * A note-by-note editor for the same format the site's sounds use, laid out
 * like a tracker under a piano roll. Start from a preset, then change notes:
 * the Hz arrows step a semitone at a time, and every step or type change
 * plays that note. Each row and block lights up as it plays.
 */
export function NotesDemo() {
  const [rows, setRows] = useState(() => toRows(PRESETS.Jump))
  const [preset, setPreset] = useState<string | null>('Jump')
  const [auditioned, setAuditioned] = useState(-1)
  const { note, play, playing, stop } = usePlayback()
  const audition = usePlayback()
  const notes = toNotes(rows)
  const active = playing ? note : audition.playing ? auditioned : -1

  /** Any edit, so the preset buttons stop claiming the rows match one. */
  function edit(change: (current: NoteRow[]) => NoteRow[]) {
    setPreset(null)
    setRows(change)
  }

  /** Changes a row, and plays its new note when `hear` is set. */
  function update(index: number, change: Partial<NoteRow>, hear = false) {
    const row = { ...(rows[index] as NoteRow), ...change }
    edit((current) => current.map((other) => (other.id === row.id ? row : other)))
    if (!hear) return
    const [[pitch, seconds]] = toNotes([row]) as [Note]
    setAuditioned(index)
    audition.play([[pitch, Math.min(seconds, 0.5)]])
  }

  function load(name: string, loaded: readonly Note[]) {
    setPreset(name)
    setRows(toRows(loaded))
  }

  function add() {
    edit((current) => [
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
        {Object.entries(PRESETS).map(([name, presetNotes]) => (
          <DemoButton
            aria-pressed={preset === name}
            key={name}
            onClick={() => load(name, presetNotes)}
            variant="secondary"
          >
            {name}
          </DemoButton>
        ))}
      </Controls>
      <PianoRoll active={active} notes={notes} />
      <div aria-hidden="true" className={`${styles.row} ${styles.heading}`}>
        <span />
        <span>Type</span>
        <span>Hz</span>
        <span>Note</span>
        <span>Seconds</span>
      </div>
      <ol className={styles.rows}>
        {rows.map((row, i) => (
          <li className={styles.row} data-active={active === i || undefined} key={row.id}>
            <span aria-hidden="true" className={styles.step}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <select
              aria-label={`Note ${i + 1} type`}
              name="kind"
              onChange={(event) => update(i, { kind: event.target.value as NoteKind }, true)}
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
              max={5000}
              min={20}
              name="pitch"
              onChange={(event) => {
                const old = Number.parseFloat(row.pitch)
                const next = Number.parseFloat(event.target.value)
                const hear = stepped(event)
                const pitch =
                  hear && old >= 20 && Math.abs(next - old) === 1
                    ? String(stepNote(old, next > old ? 1 : -1))
                    : event.target.value
                update(i, { pitch }, hear)
              }}
              type="number"
              value={row.kind === 'tone' ? row.pitch : ''}
            />
            <span aria-hidden="true" className={styles.noteName}>
              {row.kind === 'tone' ? noteName(clamp(row.pitch, 20, 5000, 440)) : ''}
            </span>
            <input
              aria-label={`Note ${i + 1} length in seconds`}
              inputMode="decimal"
              max={2}
              min={0.01}
              name="seconds"
              onChange={(event) => update(i, { seconds: event.target.value }, stepped(event))}
              step={0.01}
              type="number"
              value={row.seconds}
            />
            <button
              aria-label={`Remove note ${i + 1}`}
              className={styles.remove}
              onClick={() => edit((current) => current.filter((other) => other.id !== row.id))}
              type="button"
            >
              &times;
            </button>
          </li>
        ))}
      </ol>
      <Controls>
        <DemoButton
          disabled={rows.length === 0}
          onClick={playing ? stop : () => play(notes)}
          playing={playing}
        />
        <DemoButton disabled={rows.length >= MAX_ROWS} onClick={add} variant="secondary">
          Add a note
        </DemoButton>
      </Controls>
      <div className={styles.output}>
        <pre className={styles.code}>
          <code>{formatNotes(notes)}</code>
        </pre>
        <Caption>
          Your sound as a list of notes, in the same format as <code>SOUNDS</code>.
        </Caption>
      </div>
    </>
  )
}
