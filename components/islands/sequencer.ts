/**
 * A step sequencer on the audio clock, for music longer than a sound effect.
 * Songs are written like a tracker: one lane per voice, one token per step.
 */

const NOTE = /^([A-G])([#b]?)(\d)$/
const LOOKAHEAD = 0.15
const TICK_MS = 25

/** A note name such as `C5`, `F#4`, or `Bb3` in hertz, or undefined for any other token. */
export function noteFrequency(name: string): number | undefined {
  const match = NOTE.exec(name)
  if (!match) return undefined
  const [, letter, accidental, octave] = match as unknown as [string, string, string, string]
  const semitone =
    'C D EF G A B'.indexOf(letter) + Number(accidental === '#') - Number(accidental === 'b')
  const midi = (Number(octave) + 1) * 12 + semitone
  return 440 * 2 ** ((midi - 69) / 12)
}

/** A note in a lane: the step it starts on, how many steps it lasts, and its token. */
export interface LaneNote {
  step: number
  steps: number
  token: string
}

/** A parsed lane: how many steps it runs before it loops, and its notes by step. */
export interface Lane {
  length: number
  notes: Map<number, LaneNote>
}

/**
 * Reads a lane written like a tracker: one token per step, `-` holds the note
 * before it, and `.` is silence. Each string is a bar; bars play in order.
 */
export function parseLane(bars: readonly string[]): Lane {
  const tokens = bars.join(' ').split(/\s+/).filter(Boolean)
  const notes = new Map<number, LaneNote>()
  let last: LaneNote | undefined
  for (const [step, token] of tokens.entries()) {
    if (token === '-') {
      if (last && last.step + last.steps === step) last.steps++
    } else if (token === '.') {
      last = undefined
    } else {
      last = { step, steps: 1, token }
      notes.set(step, last)
    }
  }
  return { length: tokens.length, notes }
}

/** The note a looping lane starts on a step, if any. */
export function noteAt(lane: Lane, step: number): LaneNote | undefined {
  return lane.notes.get(step % lane.length)
}

/** The pitched note a lane starts on a step, in hertz, and how many steps it lasts. */
export function toneAt(lane: Lane, step: number): { hz: number; steps: number } | undefined {
  const note = noteAt(lane, step)
  const hz = note ? noteFrequency(note.token) : undefined
  return note && hz ? { hz, steps: note.steps } : undefined
}

/**
 * Calls `onStep` for every step, forever, with the audio-clock time it should
 * sound at. A timer wakes every 25 ms and schedules whatever falls in the next
 * 150 ms. The timer can run late without the music running late, because each
 * note is booked on the audio clock ahead of time. `stepSeconds` is read for
 * every step, so tempo and swing can change while it plays. Returns a function
 * that stops it.
 */
export function startSequencer(
  audio: AudioContext,
  stepSeconds: (step: number) => number,
  onStep: (step: number, time: number) => void,
): () => void {
  let step = 0
  let time = audio.currentTime + 0.05
  function tick() {
    while (time < audio.currentTime + LOOKAHEAD) {
      onStep(step, time)
      time += stepSeconds(step)
      step++
    }
  }
  tick()
  const timer = setInterval(tick, TICK_MS)
  return () => clearInterval(timer)
}
