/**
 * The `/geocities` soundtrack, made on the spot like the site's other sounds:
 * a dial-up modem handshake, then an original space fanfare.
 */

import { parseLane, toneAt } from '@/components/islands/sequencer'
import { getContext, noiseBuffer } from '@/components/islands/sounds'

/** The number the modem dials, after the Enterprise-D's registry, NCC-1701-D. */
export const DIAL_NUMBER = '551-701D'

const DTMF_ROWS = [697, 770, 852, 941]
// The fourth column (A to D) was on military phones, and every modem could dial it.
const DTMF_COLUMNS = [1209, 1336, 1477, 1633]
const KEYPAD = ['123A', '456B', '789C', '*0#D']

/** The two tones a phone keypad sends for a key, or undefined for anything else. */
export function getDtmf(key: string): [low: number, high: number] | undefined {
  const row = KEYPAD.findIndex((keys) => keys.includes(key))
  if (row < 0) return undefined
  return [DTMF_ROWS[row] as number, DTMF_COLUMNS[(KEYPAD[row] as string).indexOf(key)] as number]
}

/** One piece of the handshake, in seconds from its start. */
export type Segment =
  | { kind: 'tone'; hz: readonly number[]; start: number; seconds: number }
  | { kind: 'sweep'; from: number; to: number; start: number; seconds: number }
  | { kind: 'hiss'; start: number; seconds: number }

/** The handshake's pieces, when the far modem answers, and how long it all lasts. */
export interface Handshake {
  segments: Segment[]
  answer: number
  seconds: number
}

const KEY_SECONDS = 0.09
const KEY_GAP = 0.06

/**
 * A dial-up call: dial tone, the number in DTMF, the far modem's 2100 Hz
 * answer tone, a run of short tone bursts while the two modems compare notes,
 * then the screech of noise and sweeping tones as they train their line.
 */
export function buildHandshake(number = DIAL_NUMBER): Handshake {
  const segments: Segment[] = [{ kind: 'tone', hz: [350, 440], start: 0, seconds: 0.8 }]
  let time = 1
  for (const key of number) {
    const pair = getDtmf(key)
    if (!pair) continue
    segments.push({ kind: 'tone', hz: pair, start: time, seconds: KEY_SECONDS })
    time += KEY_SECONDS + KEY_GAP
  }
  const answer = time + 0.3
  segments.push({ kind: 'tone', hz: [2100], start: answer, seconds: 1.2 })
  time = answer + 1.3
  for (let burst = 0; burst < 10; burst++) {
    segments.push({ kind: 'tone', hz: [burst % 2 ? 2400 : 1200], start: time, seconds: 0.07 })
    time += 0.1
  }
  const screech = time + 0.05
  segments.push(
    { kind: 'hiss', start: screech, seconds: 2 },
    { kind: 'sweep', from: 600, to: 3400, start: screech, seconds: 0.9 },
    { kind: 'sweep', from: 3400, to: 1800, start: screech + 0.9, seconds: 1.1 },
    { kind: 'tone', hz: [1800], start: screech + 0.3, seconds: 1.7 },
  )
  return { segments, answer, seconds: screech + 2 }
}

/** Hanging up: the modem's relay clicks, then the phone company's fast busy signal. */
export function buildHangUp(): Segment[] {
  const segments: Segment[] = [{ kind: 'hiss', start: 0, seconds: 0.03 }]
  for (let beep = 0; beep < 4; beep++) {
    segments.push({ kind: 'tone', hz: [480, 620], start: 0.2 + beep * 0.5, seconds: 0.25 })
  }
  return segments
}

/** The fanfare's voices, from the top of the score down. */
export const VOICES = ['lead', 'horn', 'violins', 'violas', 'bass', 'drums'] as const

export type Voice = (typeof VOICES)[number]

/**
 * A piece for the six voices. Each lane is a list of bars, and each beat is
 * `stepsPerBeat` steps, so six steps fit both triplets and dotted rhythms.
 */
export interface Score {
  title: string
  bpm: number
  stepsPerBeat: number
  lanes: Record<Voice, readonly string[]>
}

/**
 * A bar written as `token:steps` pairs, such as `D5:6 .:2`, in the lane format
 * `parseLane` reads: a token, then `-` for each step it holds.
 */
function bar(notes: string): string {
  return notes
    .split(' ')
    .map((note) => {
      const [token = '.', steps = '1'] = note.split(':')
      return [token, ...Array<string>(Number(steps) - 1).fill(token === '.' ? '.' : '-')].join(' ')
    })
    .join(' ')
}

/** A bass bar that marches between a root and its fifth. */
function march(root: string, fifth: string): string {
  return bar(`${root}:5 .:1 ${fifth}:5 .:1 ${root}:5 .:1 ${fifth}:3 ${root}:2 .:1`)
}

const ROLL = bar('t:2 '.repeat(12).trim())
const SWELL = bar('t:4 t:4 t:4 t:2 t:2 t:2 t:2 t:2 t:2')
// Timpani on one and three, snare on two, and a triplet snare pickup into the next bar.
const STEP = bar('t:6 s:6 t:6 s:2 s:2 s:2')
const LAUNCH = bar('c:6 s:6 t:6 s:2 s:2 s:2')

/**
 * An original fanfare in D, scored like a TV starship theme: a slow horn call
 * over strings and a timpani roll, a cymbal crash into a stately march with
 * triplet pickups, a lift through B-flat and C, and a held D major chord.
 */
export const FANFARE: Score = {
  title: 'Signal from the Alpha Quadrant',
  bpm: 76,
  stepsPerBeat: 6,
  lanes: {
    lead: [
      bar('.:24'),
      bar('.:24'),
      bar('F#5:12 A5:4 G5:2 F#5:6'),
      bar('D6:12 C#6:4 B5:2 F#5:6'),
      bar('B5:8 A5:2 G5:2 D5:12'),
      bar('E5:4 F#5:2 G5:6 A5:6 C#6:6'),
      bar('D6:18 A5:2 B5:2 C#6:2'),
      bar('F5:6 Bb5:6 C6:6 E6:6'),
      bar('D6:22 .:2'),
    ],
    horn: [
      bar('D4:4 E4:2 F#4:6 B4:12'),
      bar('A4:6 F4:6 D4:12'),
      bar('D4:12 A4:12'),
      bar('F#4:12 D4:12'),
      bar('G4:12 B4:12'),
      bar('C#5:12 E5:12'),
      bar('A4:24'),
      bar('D5:12 E5:12'),
      bar('F#4:22 .:2'),
    ],
    violins: [
      bar('A4:24'),
      bar('F4:24'),
      bar('A4:24'),
      bar('B4:24'),
      bar('B4:24'),
      bar('C#5:24'),
      bar('A4:24'),
      bar('F4:12 G4:12'),
      bar('A4:22 .:2'),
    ],
    violas: [
      bar('D4:24'),
      bar('D4:24'),
      bar('F#4:24'),
      bar('F#4:24'),
      bar('G4:24'),
      bar('E4:24'),
      bar('F#4:24'),
      bar('D4:12 E4:12'),
      bar('F#4:22 .:2'),
    ],
    bass: [
      bar('D2:24'),
      bar('Bb1:24'),
      march('D2', 'A2'),
      march('B1', 'F#2'),
      march('G2', 'D2'),
      march('A2', 'E2'),
      march('D2', 'A2'),
      bar('Bb1:11 .:1 C2:11 .:1'),
      bar('D2:22 .:2'),
    ],
    drums: [SWELL, ROLL, LAUNCH, STEP, STEP, STEP, LAUNCH, ROLL, bar('c:24')],
  },
}

/** How long a score lasts, with the last chord's ring. */
export function getScoreSeconds(score: Score): number {
  return parseLane(score.lanes.lead).length * stepSeconds(score) + 2
}

function stepSeconds(score: Score): number {
  return 60 / score.bpm / score.stepsPerBeat
}

const LEVEL = 0.05

function playSegment(audio: AudioContext, out: AudioNode, segment: Segment, at: number) {
  const start = at + segment.start
  const end = start + segment.seconds
  const gain = audio.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(LEVEL, start + 0.01)
  gain.gain.setValueAtTime(LEVEL, end - 0.02)
  gain.gain.linearRampToValueAtTime(0, end)
  gain.connect(out)
  if (segment.kind === 'hiss') {
    const filter = audio.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, start)
    filter.frequency.exponentialRampToValueAtTime(3500, end)
    const source = audio.createBufferSource()
    source.buffer = noiseBuffer(audio, 1)
    source.loop = true
    source.connect(filter).connect(gain)
    source.start(start)
    source.stop(end)
    return
  }
  const pitches = segment.kind === 'sweep' ? [segment.from] : segment.hz
  for (const hz of pitches) {
    const oscillator = audio.createOscillator()
    oscillator.frequency.setValueAtTime(hz, start)
    if (segment.kind === 'sweep') oscillator.frequency.exponentialRampToValueAtTime(segment.to, end)
    oscillator.connect(gain)
    oscillator.start(start)
    oscillator.stop(end)
  }
}

/**
 * How each pitched voice sounds: its wave, loudness, attack in seconds,
 * lowpass cutoff, and the detune in cents of each oscillator. Two oscillators
 * a few cents apart make one voice sound like a section of players.
 */
const TIMBRES: Record<
  Exclude<Voice, 'drums'>,
  [OscillatorType, number, number, number, readonly number[]]
> = {
  lead: ['sawtooth', 0.03, 0.06, 2200, [-7, 7]],
  horn: ['sawtooth', 0.04, 0.08, 900, [0]],
  violins: ['sawtooth', 0.018, 0.5, 1400, [-10, 10]],
  violas: ['sawtooth', 0.018, 0.5, 1100, [-10, 10]],
  bass: ['triangle', 0.12, 0.01, 8000, [0]],
}

function playTone(
  audio: AudioContext,
  out: AudioNode,
  voice: Exclude<Voice, 'drums'>,
  hz: number,
  start: number,
  seconds: number,
) {
  const [type, level, attack, cutoff, detunes] = TIMBRES[voice]
  const end = start + seconds
  const gain = audio.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(level, start + attack)
  gain.gain.setTargetAtTime(level * 0.8, start + attack, 0.4)
  gain.gain.setTargetAtTime(0, end - 0.05, 0.05)
  gain.connect(out)
  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = cutoff
  filter.connect(gain)
  for (const detune of detunes) {
    const oscillator = audio.createOscillator()
    oscillator.type = type
    oscillator.frequency.value = hz
    oscillator.detune.value = detune
    oscillator.connect(filter)
    oscillator.start(start)
    oscillator.stop(end + 0.3)
  }
}

/** A noise hit: grit, loudness, and seconds it rings. */
const NOISES: Record<string, [grit: number, level: number, seconds: number]> = {
  c: [1, 0.035, 2],
  s: [2, 0.04, 0.12],
}

/** A timpani hit (`t`) is a sine that drops in pitch; a crash (`c`) and snare (`s`) are noise. */
function playDrum(audio: AudioContext, out: AudioNode, token: string, start: number) {
  const gain = audio.createGain()
  gain.connect(out)
  const noise = NOISES[token]
  if (noise) {
    const [grit, level, seconds] = noise
    const source = audio.createBufferSource()
    source.buffer = noiseBuffer(audio, grit)
    source.loop = true
    gain.gain.setValueAtTime(level, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + seconds)
    source.connect(gain)
    source.start(start)
    source.stop(start + seconds)
    return
  }
  const oscillator = audio.createOscillator()
  oscillator.frequency.setValueAtTime(98, start)
  oscillator.frequency.exponentialRampToValueAtTime(73, start + 0.5)
  gain.gain.setValueAtTime(0.18, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7)
  oscillator.connect(gain)
  oscillator.start(start)
  oscillator.stop(start + 0.7)
}

function playScore(audio: AudioContext, out: AudioNode, score: Score, at: number) {
  const step = stepSeconds(score)
  for (const voice of VOICES) {
    const lane = parseLane(score.lanes[voice])
    for (const note of lane.notes.values()) {
      const start = at + note.step * step
      if (voice === 'drums') {
        playDrum(audio, out, note.token, start)
        continue
      }
      const tone = toneAt(lane, note.step)
      // Every pitched token in the fanfare is a note name; the type allows undefined.
      /* v8 ignore next */
      if (tone) playTone(audio, out, voice, tone.hz, start, tone.steps * step)
    }
  }
}

/** Where a transmission is: dialing, the modems talking, the fanfare, or done. */
export type Phase = 'dialing' | 'handshake' | 'playing' | 'idle'

/** Ends a transmission early. It plays the hang-up sound unless `quietly` is set. */
export type HangUp = (options?: { quietly?: boolean }) => void

/**
 * Books the handshake and the fanfare on the audio clock, and calls `onPhase`
 * as each part starts and once it all ends. Call it from a click, since
 * browsers only start audio after a user gesture. Returns a function that
 * hangs up early, or undefined where Web Audio is missing.
 */
export function startTransmission(onPhase: (phase: Phase) => void): HangUp | undefined {
  const audio = getContext()
  if (!audio) return undefined
  const master = audio.createGain()
  master.connect(audio.destination)
  const at = audio.currentTime + 0.05
  const handshake = buildHandshake()
  for (const segment of handshake.segments) playSegment(audio, master, segment, at)
  playScore(audio, master, FANFARE, at + handshake.seconds + 0.4)

  const total = handshake.seconds + 0.4 + getScoreSeconds(FANFARE)
  onPhase('dialing')
  const timers = [
    setTimeout(() => onPhase('handshake'), handshake.answer * 1000),
    setTimeout(() => onPhase('playing'), (handshake.seconds + 0.4) * 1000),
    setTimeout(() => onPhase('idle'), total * 1000),
  ]
  return ({ quietly = false } = {}) => {
    for (const timer of timers) clearTimeout(timer)
    master.gain.setTargetAtTime(0, audio.currentTime, 0.02)
    setTimeout(() => master.disconnect(), 200)
    if (quietly) return
    const line = audio.createGain()
    line.connect(audio.destination)
    for (const segment of buildHangUp()) playSegment(audio, line, segment, audio.currentTime + 0.05)
  }
}
