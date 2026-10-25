import { startSequencer } from '@/components/islands/sequencer'
import { getContext, noiseBuffer } from '@/components/islands/sounds'

/**
 * What every tape deck track has, whatever plays it. `swing` stretches each
 * on-beat sixteenth and shortens the next.
 */
export interface TapeTrack {
  title: string
  bpm: number
  swing: number
  bars: number
  /** What plays under the music. */
  texture: 'vinyl' | 'rain'
}

/** A track that's playing, with the lo-fi knob still live. */
export interface Tape {
  now: () => number
  setLofi: (amount: number) => void
  stop: () => void
}

/** Starts a track on a tape deck. */
export type StartTape<T extends TapeTrack> = (
  track: T,
  lofi: number,
  onStep: (step: number, time: number) => void,
  onEnd: () => void,
) => Tape | undefined

/** Where an engine's instruments plug into the tape. */
export interface TapeChain {
  audio: AudioContext
  /** The lowpass filter every instrument plays through. */
  filter: BiquadFilterNode
  /** Bends an oscillator's pitch with the tape wobble. */
  bend: (oscillator: OscillatorNode) => void
}

/** How a lo-fi amount from 0 (clean) to 1 (worn-out tape) sets each effect. */
export function lofiSettings(amount: number): { cutoff: number; wobble: number; crackle: number } {
  return {
    cutoff: Math.round(16000 * (600 / 16000) ** amount),
    wobble: Math.round(amount * 24),
    crackle: amount * 0.12,
  }
}

/** Seconds a sixteenth note lasts, with swing: long on the beat, short off it. */
export function swungStep(track: Pick<TapeTrack, 'bpm' | 'swing'>, step: number): number {
  const straight = 60 / track.bpm / 4
  return straight * (step % 2 === 0 ? 1 + track.swing : 1 - track.swing)
}

/**
 * Three seconds of record noise: a faint hiss with a pop every so often. The
 * pops come from a seeded generator, so every play crackles the same way.
 */
function crackleBuffer(audio: AudioContext): AudioBuffer {
  const buffer = audio.createBuffer(1, audio.sampleRate * 3, audio.sampleRate)
  const data = buffer.getChannelData(0)
  let seed = 11
  function random() {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  let pop = 0
  for (let i = 0; i < data.length; i++) {
    if (random() < 0.0003) pop = (random() * 2 - 1) * 0.9
    data[i] = (random() * 2 - 1) * 0.015 + pop
    pop *= 0.6
  }
  return buffer
}

/**
 * Plays a track through a lo-fi chain until stopped: everything runs through
 * a lowpass filter, a slow wobble bends every note like a stretched tape, and a
 * crackle loop plays on top. `setup` builds the engine's instruments on the
 * chain and returns what plays on each sixteenth note. `onStep` hears each
 * step and its audio-clock time; `onEnd` runs when the track's last bar
 * finishes. Returns undefined where Web Audio is missing.
 */
export function playTape(
  track: TapeTrack,
  lofi: number,
  onStep: (step: number, time: number) => void,
  onEnd: () => void,
  setup: (chain: TapeChain) => (step: number, time: number) => void,
): Tape | undefined {
  const context = getContext()
  if (!context) return undefined
  const audio = context
  const settings = lofiSettings(lofi)

  const master = audio.createGain()
  master.gain.value = 0.9
  master.connect(audio.destination)

  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = settings.cutoff
  filter.connect(master)

  const wobble = audio.createOscillator()
  wobble.frequency.value = 0.45
  const depth = audio.createGain()
  depth.gain.value = settings.wobble
  wobble.connect(depth)
  wobble.start()

  // Vinyl is the crackle loop. Rain is noise through a bandpass filter, with
  // the crackle under it for the drops.
  const crackle = audio.createBufferSource()
  crackle.buffer = crackleBuffer(audio)
  crackle.loop = true
  const crackleLevel = audio.createGain()
  crackleLevel.gain.value = settings.crackle
  crackle.connect(crackleLevel).connect(master)
  crackle.start()
  const rain = audio.createBufferSource()
  rain.buffer = noiseBuffer(audio, 1)
  rain.loop = true
  const rainBand = audio.createBiquadFilter()
  rainBand.type = 'bandpass'
  rainBand.frequency.value = 1400
  const rainLevel = audio.createGain()
  rainLevel.gain.value = track.texture === 'rain' ? settings.crackle * 0.5 : 0
  rain.connect(rainBand).connect(rainLevel).connect(master)
  rain.start()

  function bend(oscillator: OscillatorNode) {
    depth.connect(oscillator.detune)
    // The wobble never stops, so its link would keep every finished note alive.
    oscillator.onended = () => depth.disconnect(oscillator.detune)
  }

  const play = setup({ audio, filter, bend })
  const totalSteps = track.bars * 16
  let ending: ReturnType<typeof setTimeout> | undefined

  const stopSequencer = startSequencer(
    audio,
    (step) => swungStep(track, step),
    (step, time) => {
      if (step >= totalSteps) {
        if (step === totalSteps) {
          ending = setTimeout(onEnd, Math.max(0, time - audio.currentTime) * 1000)
        }
        return
      }
      onStep(step, time)
      play(step, time)
    },
  )

  return {
    now: () => audio.currentTime,
    setLofi(amount) {
      const next = lofiSettings(amount)
      filter.frequency.setTargetAtTime(next.cutoff, audio.currentTime, 0.05)
      depth.gain.setTargetAtTime(next.wobble, audio.currentTime, 0.05)
      crackleLevel.gain.setTargetAtTime(next.crackle, audio.currentTime, 0.05)
      if (track.texture === 'rain') {
        rainLevel.gain.setTargetAtTime(next.crackle * 0.5, audio.currentTime, 0.05)
      }
    },
    stop() {
      stopSequencer()
      // A track stopped in its last moments shouldn't start the next one.
      clearTimeout(ending)
      master.gain.setTargetAtTime(0, audio.currentTime, 0.03)
      setTimeout(() => {
        wobble.stop()
        crackle.stop()
        rain.stop()
        master.disconnect()
      }, 300)
    },
  }
}
