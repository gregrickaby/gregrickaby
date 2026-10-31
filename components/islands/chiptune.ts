import { noteAt, parseLane, startSequencer, toneAt } from '@/components/islands/sequencer'
import { getContext, noiseBuffer } from '@/components/islands/sounds'

/** The NES's four music channels, in the order a tracker lists them. */
export const CHANNELS = ['pulse1', 'pulse2', 'triangle', 'noise'] as const

export type Channel = (typeof CHANNELS)[number]

/** A song for the four channels. Each lane is a list of 16-step bars. */
export interface Song {
  title: string
  bpm: number
  lanes: Record<Channel, readonly string[]>
}

/**
 * The cosine and sine terms of a pulse wave that is high for `duty` of each
 * cycle. The NES pulse channels had four duties: 12.5%, 25%, 50%, and 75%.
 */
export function pulseTerms(
  duty: number,
  harmonics = 32,
): { real: Float32Array; imag: Float32Array } {
  const real = new Float32Array(harmonics + 1)
  const imag = new Float32Array(harmonics + 1)
  for (let n = 1; n <= harmonics; n++) {
    real[n] = Math.sin(2 * Math.PI * n * duty) / (Math.PI * n)
    imag[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (Math.PI * n)
  }
  return { real, imag }
}

/** Each drum is a burst from the noise channel: grit, length, and loudness. */
const DRUMS: Record<string, readonly [grit: number, seconds: number, level: number]> = {
  k: [24, 0.12, 0.09],
  s: [3, 0.1, 0.05],
  h: [1, 0.03, 0.025],
}

const LEVELS: Record<Channel, number> = {
  pulse1: 0.05,
  pulse2: 0.03,
  triangle: 0.14,
  noise: 1,
}

/** A song that's playing, with a scope tap and a mute switch per channel. */
export interface Chiptune {
  analysers: Record<Channel, AnalyserNode>
  now: () => number
  setMuted: (channel: Channel, muted: boolean) => void
  stop: () => void
}

/**
 * Plays a song on four channels until stopped, looping at the end. `bpm` is
 * read every step, so a tempo slider works mid-song. `onStep` hears each
 * sixteenth note and the audio-clock time it plays at, for a display to
 * follow. Channels in `muted` start silent. Muting or unmuting waits for the
 * next beat, so a channel comes in on time, like a player in a band. Returns
 * undefined where Web Audio is missing.
 */
export function startChiptune(
  song: Song,
  bpm: () => number,
  onStep: (step: number, time: number) => void,
  muted: ReadonlySet<Channel> = new Set(),
): Chiptune | undefined {
  const context = getContext()
  if (!context) return undefined
  const audio = context
  const master = audio.createGain()
  master.connect(audio.destination)
  const lanes = {} as Record<Channel, ReturnType<typeof parseLane>>
  const buses = {} as Record<Channel, GainNode>
  const analysers = {} as Record<Channel, AnalyserNode>
  for (const channel of CHANNELS) {
    lanes[channel] = parseLane(song.lanes[channel])
    buses[channel] = audio.createGain()
    buses[channel].gain.value = muted.has(channel) ? 0 : 1
    analysers[channel] = audio.createAnalyser()
    analysers[channel].fftSize = 1024
    buses[channel].connect(analysers[channel]).connect(master)
  }
  const waves = {
    pulse1: audio.createPeriodicWave(pulseTerms(0.25).real, pulseTerms(0.25).imag),
    pulse2: audio.createPeriodicWave(pulseTerms(0.125).real, pulseTerms(0.125).imag),
  }

  function stepSeconds() {
    return 60 / bpm() / 4
  }

  function playTone(channel: Exclude<Channel, 'noise'>, hz: number, time: number, seconds: number) {
    const oscillator = audio.createOscillator()
    if (channel === 'triangle') oscillator.type = 'triangle'
    else oscillator.setPeriodicWave(waves[channel])
    oscillator.frequency.value = hz
    const gain = audio.createGain()
    const level = LEVELS[channel]
    gain.gain.setValueAtTime(level, time)
    gain.gain.setTargetAtTime(level * 0.6, time, 0.1)
    gain.gain.setTargetAtTime(0, time + seconds - 0.02, 0.01)
    oscillator.connect(gain).connect(buses[channel])
    oscillator.start(time)
    oscillator.stop(time + seconds + 0.05)
  }

  function playDrum(token: string, time: number) {
    const drum = DRUMS[token]
    if (!drum) return
    const [grit, seconds, level] = drum
    const source = audio.createBufferSource()
    source.buffer = noiseBuffer(audio, grit)
    const gain = audio.createGain()
    gain.gain.setValueAtTime(level, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + seconds)
    source.connect(gain).connect(buses.noise)
    source.start(time)
    source.stop(time + seconds)
  }

  const pending = new Map<Channel, boolean>()

  const stopSequencer = startSequencer(audio, stepSeconds, (step, time) => {
    onStep(step, time)
    if (step % 4 === 0) {
      for (const [channel, silent] of pending) {
        buses[channel].gain.setTargetAtTime(silent ? 0 : 1, time, 0.01)
      }
      pending.clear()
    }
    const drum = noteAt(lanes.noise, step)
    if (drum) playDrum(drum.token, time)
    for (const channel of ['pulse1', 'pulse2', 'triangle'] as const) {
      const tone = toneAt(lanes[channel], step)
      if (tone) playTone(channel, tone.hz, time, tone.steps * stepSeconds())
    }
  })

  return {
    analysers,
    now: () => audio.currentTime,
    setMuted(channel, silent) {
      pending.set(channel, silent)
    },
    stop() {
      stopSequencer()
      master.gain.setTargetAtTime(0, audio.currentTime, 0.02)
      setTimeout(() => master.disconnect(), 200)
    },
  }
}
