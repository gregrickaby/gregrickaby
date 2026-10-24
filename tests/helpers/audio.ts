import { vi } from 'vitest'

/** What a test can read back from the sounds a `FakeAudioContext` played. */
export interface FakeOscillator {
  type: string
  frequency: FakeParam
  wave: { real: Float32Array; imag: Float32Array } | null
  onended?: (() => void) | null
}

/** Enough of `AudioParam` for the site's sounds and the post's players. */
export function fakeParam(value = 0) {
  return {
    value,
    setValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
}

export type FakeParam = ReturnType<typeof fakeParam>

function fakeNode<T extends object>(extra: T) {
  return { ...extra, connect: (node: unknown) => node, disconnect: vi.fn() }
}

export const oscillators: FakeOscillator[] = []
export const noiseBursts: { buffer: unknown }[] = []
export const gains: FakeParam[] = []
export const filters: { type: string; frequency: FakeParam }[] = []
/** Each analyser fills its scope with this value, so a test can draw a line. */
export const analyserLevel = { value: 0 }
export const contexts = vi.fn()
/** Every context made, so a test can suspend one. */
export const instances: FakeAudioContext[] = []
export const buffers = vi.fn()

/** Enough of `AudioContext` for `sounds.ts`, recording each node it makes. */
export class FakeAudioContext {
  currentTime = 0
  destination = {}
  sampleRate = 8
  state: AudioContextState = 'running'
  resume = vi.fn(async () => {
    this.state = 'running'
  })
  constructor() {
    contexts()
    instances.push(this)
  }
  createOscillator() {
    const oscillator = fakeNode({
      type: '',
      frequency: fakeParam(),
      detune: fakeParam(),
      wave: null as FakeOscillator['wave'],
      onended: null as (() => void) | null,
      setPeriodicWave(wave: FakeOscillator['wave']) {
        this.wave = wave
      },
      start: vi.fn(),
      stop: vi.fn(),
    })
    oscillators.push(oscillator)
    return oscillator
  }
  createPeriodicWave(real: Float32Array, imag: Float32Array) {
    return { real, imag }
  }
  createBuffer() {
    buffers()
    const data = new Float32Array(8)
    return { data, getChannelData: () => data }
  }
  createBufferSource() {
    const source = fakeNode({ buffer: null, loop: false, start: vi.fn(), stop: vi.fn() })
    noiseBursts.push(source)
    return source
  }
  createGain() {
    const gain = fakeParam(1)
    gains.push(gain)
    return fakeNode({ gain })
  }
  createBiquadFilter() {
    const filter = fakeNode({ type: 'lowpass', frequency: fakeParam(350) })
    filters.push(filter)
    return filter
  }
  createAnalyser() {
    return fakeNode({
      fftSize: 2048,
      getFloatTimeDomainData(samples: Float32Array) {
        samples.fill(analyserLevel.value)
      },
    })
  }
}

/** Swaps in a fresh `FakeAudioContext` and clears what earlier tests recorded. */
export function stubAudio() {
  vi.stubGlobal('AudioContext', FakeAudioContext)
  oscillators.length = 0
  noiseBursts.length = 0
  gains.length = 0
  filters.length = 0
  analyserLevel.value = 0
  contexts.mockClear()
  buffers.mockClear()
}
