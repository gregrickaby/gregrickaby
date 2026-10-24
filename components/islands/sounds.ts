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
type Note = readonly [pitch: number | 'noise' | 'rest', seconds: number]

const SOUNDS = {
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
let noise: AudioBuffer | undefined

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

/** A second of white noise, each value held for four samples to make it gritty. */
function noiseBuffer(audio: AudioContext): AudioBuffer {
  if (noise) return noise
  noise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i += 4) data.fill(Math.random() * 2 - 1, i, i + 4)
  return noise
}

function createSource(audio: AudioContext, pitch: number | 'noise'): AudioScheduledSourceNode {
  if (pitch === 'noise') {
    const source = audio.createBufferSource()
    source.buffer = noiseBuffer(audio)
    return source
  }
  const oscillator = audio.createOscillator()
  oscillator.type = 'square'
  oscillator.frequency.value = pitch
  return oscillator
}

/**
 * Plays a sound when sounds are on. Call it from a click or key handler:
 * browsers only start audio after a user gesture.
 */
export function playSound(name: SoundName) {
  if (!soundEnabled()) return
  context ??= new AudioContext()
  let start = context.currentTime
  for (const [pitch, seconds] of SOUNDS[name]) {
    if (pitch !== 'rest') {
      const source = createSource(context, pitch)
      const gain = context.createGain()
      gain.gain.setValueAtTime(VOLUME, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + seconds)
      source.connect(gain).connect(context.destination)
      source.start(start)
      source.stop(start + seconds)
    }
    start += seconds
  }
}
