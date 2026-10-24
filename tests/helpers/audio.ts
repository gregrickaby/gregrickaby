import { vi } from 'vitest'

/** What a test can read back from the sounds a `FakeAudioContext` played. */
export interface FakeOscillator {
  type: string
  frequency: { value: number }
  wave: { real: Float32Array; imag: Float32Array } | null
}

export const oscillators: FakeOscillator[] = []
export const noiseBursts: { buffer: unknown }[] = []
export const gains: { exponentialRampToValueAtTime: ReturnType<typeof vi.fn> }[] = []
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
    const oscillator = {
      type: '',
      frequency: { value: 0 },
      wave: null as FakeOscillator['wave'],
      setPeriodicWave(wave: FakeOscillator['wave']) {
        this.wave = wave
      },
      connect: (node: unknown) => node,
      start: vi.fn(),
      stop: vi.fn(),
    }
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
    const source = { buffer: null, connect: (node: unknown) => node, start: vi.fn(), stop: vi.fn() }
    noiseBursts.push(source)
    return source
  }
  createGain() {
    const gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
    gains.push(gain)
    return { gain, connect: (node: unknown) => node }
  }
}

/** Swaps in a fresh `FakeAudioContext` and clears what earlier tests recorded. */
export function stubAudio() {
  vi.stubGlobal('AudioContext', FakeAudioContext)
  oscillators.length = 0
  noiseBursts.length = 0
  gains.length = 0
  contexts.mockClear()
  buffers.mockClear()
}
