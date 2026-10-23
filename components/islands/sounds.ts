/**
 * 8-bit sound effects, synthesized with square waves like an old game console,
 * so there are no audio files to download. Sounds are off until the visitor
 * turns them on; the choice lives in localStorage, so pages stay static.
 */

const STORAGE_KEY = 'sound-effects'
const VOLUME = 0.05

/** Each note is a frequency in hertz and a length in seconds, played in order. */
type Note = readonly [hertz: number, seconds: number]

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
  step: [[880, 0.03]],
  hover: [[1175, 0.02]],
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
 * Plays a sound when sounds are on. Call it from a click or key handler:
 * browsers only start audio after a user gesture.
 */
export function playSound(name: SoundName) {
  if (!soundEnabled()) return
  context ??= new AudioContext()
  let start = context.currentTime
  for (const [hertz, seconds] of SOUNDS[name]) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'square'
    oscillator.frequency.value = hertz
    gain.gain.setValueAtTime(VOLUME, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + seconds)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + seconds)
    start += seconds
  }
}
