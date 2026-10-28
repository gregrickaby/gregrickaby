/**
 * 8-bit sound effects, synthesized with square waves like an old game console,
 * so there are no audio files to download. Sounds are off until the visitor
 * turns them on; the choice lives in localStorage, so pages stay static.
 */

const STORAGE_KEY = 'sound-effects'
const VOLUME = 0.05

/**
 * Each note is a frequency in hertz (a square wave), `noise` (a burst of
 * hiss, like the NES noise channel), or `rest`, and a length in seconds.
 * Notes play in order.
 */
export type Note = readonly [pitch: number | 'noise' | 'rest', seconds: number]

export const SOUNDS = {
  'sound-on': [
    [523, 0.06],
    [659, 0.06],
    [784, 0.06],
    [1047, 0.12],
  ],
  'switch-on': [
    [523, 0.05],
    [784, 0.08],
  ],
  'switch-off': [
    [784, 0.05],
    [523, 0.08],
  ],
  copy: [
    [988, 0.06],
    [1319, 0.18],
  ],
  open: [
    [392, 0.04],
    [523, 0.04],
    [659, 0.06],
  ],
  close: [
    [659, 0.04],
    [523, 0.04],
    [392, 0.06],
  ],
  /** A camera shutter: the mirror flips up, then the shutter closes. */
  shutter: [
    ['noise', 0.03],
    ['rest', 0.06],
    ['noise', 0.05],
  ],
  step: [[880, 0.03]],
  select: [
    [659, 0.03],
    [1319, 0.07],
  ],
  hover: [[1175, 0.02]],
  /** Super Mario Bros.' coin: B5, then a ringing E6. */
  coin: [
    [988, 0.08],
    [1319, 0.5],
  ],
  /**
   * A level-clear fanfare for a visitor's tenth like: three rising arpeggios
   * (C, F, G), then a ringing C.
   */
  fanfare: [
    [523, 0.07],
    [659, 0.07],
    [784, 0.07],
    [1047, 0.16],
    ['rest', 0.04],
    [698, 0.07],
    [880, 0.07],
    [1047, 0.07],
    [1397, 0.16],
    ['rest', 0.04],
    [784, 0.07],
    [988, 0.07],
    [1175, 0.07],
    [1568, 0.16],
    ['rest', 0.06],
    [1047, 0.09],
    [1047, 0.09],
    [1047, 0.09],
    [2093, 0.7],
  ],
  rise: [
    [523, 0.04],
    [659, 0.04],
    [784, 0.04],
    [1047, 0.04],
    [1319, 0.08],
  ],
} satisfies Record<string, readonly Note[]>

export type SoundName = keyof typeof SOUNDS

const listeners = new Set<() => void>()
let context: AudioContext | undefined
const noise = new Map<number, AudioBuffer>()

/** True when the visitor turned sounds on. Storage can throw in private windows. */
export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

/** Saves the choice and tells subscribers, such as the toggle button. */
export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    // The choice lasts until the page closes.
  }
  for (const listener of listeners) listener()
}

/** For `useSyncExternalStore`: hears this tab's changes and other tabs'. */
export function subscribeSound(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

/**
 * A second of white noise, each value held for `grit` samples. Holding values
 * lowers the effective sample rate, which trades fizz for crunch.
 */
export function noiseBuffer(audio: AudioContext, grit: number): AudioBuffer {
  const cached = noise.get(grit)
  if (cached) return cached
  const buffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += grit) data.fill(Math.random() * 2 - 1, i, i + grit)
  noise.set(grit, buffer)
  return buffer
}

/**
 * A square wave built from its first `harmonics` odd harmonics, each at
 * 1/n the strength of the fundamental. One harmonic is a sine wave.
 */
function partialSquare(audio: AudioContext, harmonics: number): PeriodicWave {
  const imag = new Float32Array(harmonics * 2)
  for (let n = 1; n < imag.length; n += 2) imag[n] = 4 / (Math.PI * n)
  return audio.createPeriodicWave(new Float32Array(imag.length), imag)
}

/** How {@link playNotes} shapes each note. The site's sounds use the defaults. */
export interface PlayOptions {
  /** Fade each note out, which also hides the click of a wave stopping mid-swing. */
  fade?: boolean
  /** Samples to hold each noise value for. The site's sounds use 4. */
  grit?: number
  /** Build tones from this many odd harmonics instead of a true square wave. */
  harmonics?: number
  /** Where the notes go instead of the speakers, so a demo can cut them off. */
  destination?: AudioNode
}

function createSource(
  audio: AudioContext,
  pitch: number | 'noise',
  { grit = 4, harmonics }: PlayOptions,
): AudioScheduledSourceNode {
  if (pitch === 'noise') {
    const source = audio.createBufferSource()
    source.buffer = noiseBuffer(audio, grit)
    return source
  }
  const oscillator = audio.createOscillator()
  if (harmonics) oscillator.setPeriodicWave(partialSquare(audio, harmonics))
  else oscillator.type = 'square'
  oscillator.frequency.value = pitch
  return oscillator
}

/**
 * The shared context, or undefined where Web Audio is missing or the page
 * hasn't had a click, tap, or key press yet. Browsers warn about a context
 * made before then (by a hover tick on a fresh page) and keep it silent
 * anyway. A context can still be suspended later, so each call asks it to
 * resume.
 */
export function getContext(): AudioContext | undefined {
  if (navigator.userActivation?.hasBeenActive === false) return undefined
  try {
    context ??= new AudioContext()
  } catch {
    return undefined
  }
  if (context.state === 'suspended') context.resume().catch(() => undefined)
  return context
}

/**
 * Plays notes in order, whether or not sounds are on: demos call it from
 * their own play buttons. Call it from a click or key handler, since
 * browsers only start audio after a user gesture.
 *
 * @returns How many seconds the notes last, or 0 where Web Audio is missing.
 */
export function playNotes(notes: readonly Note[], options: PlayOptions = {}): number {
  const audio = getContext()
  if (!audio) return 0
  const begin = audio.currentTime
  let start = begin
  for (const [pitch, seconds] of notes) {
    if (pitch !== 'rest') {
      const source = createSource(audio, pitch, options)
      const gain = audio.createGain()
      gain.gain.setValueAtTime(VOLUME, start)
      if (options.fade !== false) gain.gain.exponentialRampToValueAtTime(0.001, start + seconds)
      source.connect(gain).connect(options.destination ?? audio.destination)
      source.start(start)
      source.stop(start + seconds)
    }
    start += seconds
  }
  return start - begin
}

const STOP_FADE = 0.05

/**
 * Starts a tone that plays until the returned function stops it, with a short
 * fade so it ends without a click. Like {@link playNotes}, call it from a
 * click or key handler. Returns undefined where Web Audio is missing.
 */
export function startTone(pitch: number, options: PlayOptions = {}): (() => void) | undefined {
  const audio = getContext()
  if (!audio) return undefined
  const source = createSource(audio, pitch, options)
  const gain = audio.createGain()
  gain.gain.setValueAtTime(VOLUME, audio.currentTime)
  source.connect(gain).connect(audio.destination)
  source.start()
  return () => {
    const end = audio.currentTime + STOP_FADE
    gain.gain.setValueAtTime(VOLUME, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, end)
    source.stop(end)
  }
}

/** Plays one of the site's sounds when the visitor turned sounds on. */
export function playSound(name: SoundName) {
  if (soundEnabled()) playNotes(SOUNDS[name])
}
