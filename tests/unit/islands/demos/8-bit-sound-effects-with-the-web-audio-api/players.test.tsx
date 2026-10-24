// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  describeJukebox,
  drawScope,
  JukeboxDemo,
} from '@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/jukebox'
import {
  describeLofi,
  formatTime,
  TapeDemo,
} from '@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/tape-deck'
import { analyserLevel, gains, instances, oscillators, stubAudio } from '@/tests/helpers/audio'

beforeEach(() => {
  stubAudio()
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** Moves the audio clock, then lets timers and animation frames catch up. */
function advance(seconds: number) {
  const audio = instances.at(-1)
  if (audio) audio.currentTime += seconds
  act(() => vi.advanceTimersByTime(50))
}

function fakeCanvasContext() {
  return {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    stroke: vi.fn(),
    lineWidth: 0,
    strokeStyle: '',
  }
}

describe('drawScope', () => {
  it('skips a missing canvas or one without a 2D context', () => {
    const analyser = { getFloatTimeDomainData: vi.fn() } as unknown as AnalyserNode
    drawScope(null, analyser, new Float32Array(4))
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(null)
    drawScope(canvas, analyser, new Float32Array(4))
    expect(analyser.getFloatTimeDomainData).not.toHaveBeenCalled()
  })

  it('draws the wave across the canvas, scaled to fill it', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 50
    const context = fakeCanvasContext()
    vi.spyOn(canvas, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
    const analyser = {
      getFloatTimeDomainData: (samples: Float32Array) => samples.set([0.05, -0.05, 0]),
    } as unknown as AnalyserNode
    drawScope(canvas, analyser, new Float32Array(3))
    expect(context.moveTo).toHaveBeenCalledWith(0, 5)
    expect(context.lineTo).toHaveBeenCalledWith(50, 45)
    expect(context.lineTo).toHaveBeenCalledWith(100, 25)
    expect(context.stroke).toHaveBeenCalled()
  })
})

describe('describeJukebox', () => {
  it("names each stage of the build, or lists a mix of the reader's own", () => {
    expect(describeJukebox(new Set(['noise']))).toMatch(/^Drums only/)
    expect(describeJukebox(new Set(['noise', 'triangle', 'pulse2', 'pulse1']))).toMatch(
      /whole song/,
    )
    expect(describeJukebox(new Set())).toMatch(/Everything is off/)
    expect(describeJukebox(new Set(['pulse1', 'triangle']))).toBe('Your mix: bass, melody.')
  })
})

describe('JukeboxDemo', () => {
  it('starts with the drums and brings in a part every two bars, on the beat', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeCanvasContext() as unknown as CanvasRenderingContext2D,
    )
    analyserLevel.value = 0.1
    render(<JukeboxDemo />)
    const drums = screen.getByRole('switch', { name: /Drums/ })
    const bass = screen.getByRole('switch', { name: /Bass/ })
    const melody = screen.getByRole('switch', { name: /Melody/ })
    expect(drums.getAttribute('aria-checked')).toBe('true')
    expect(bass.getAttribute('aria-checked')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(oscillators.some((o) => o.type === 'triangle')).toBe(true)
    const buses = gains.slice(1, 5)
    expect(buses.map((g) => g.value)).toEqual([0, 0, 0, 1])
    advance(3)
    expect(bass.getAttribute('aria-checked')).toBe('false')
    advance(0.2)
    expect(bass.getAttribute('aria-checked')).toBe('true')
    expect(buses[2]?.setTargetAtTime).toHaveBeenCalledWith(1, expect.any(Number), 0.01)
    advance(3.2)
    expect(melody.getAttribute('aria-checked')).toBe('false')
    advance(3.2)
    expect(melody.getAttribute('aria-checked')).toBe('true')
    expect(screen.getByText(/whole song/)).toBeTruthy()
    advance(3.2)
    fireEvent.click(drums)
    expect(screen.getByText('Your mix: bass, rhythm, melody.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })

  it('stops building once the reader flips a switch', () => {
    render(<JukeboxDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    fireEvent.click(screen.getByRole('switch', { name: /Drums/ }))
    expect(screen.getByText(/Everything is off/)).toBeTruthy()
    advance(3.4)
    expect(screen.getByRole('switch', { name: /Bass/ }).getAttribute('aria-checked')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('switch', { name: /Drums/ }).getAttribute('aria-checked')).toBe('true')
  })

  it('flips switches while stopped', () => {
    render(<JukeboxDemo />)
    fireEvent.click(screen.getByRole('switch', { name: /Melody/ }))
    expect(screen.getByText('Your mix: drums, melody.')).toBeTruthy()
  })

  it('stays stopped where Web Audio is missing', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', undefined)
    const fresh =
      await import('@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/jukebox')
    render(<fresh.JukeboxDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })
})

describe('tape helpers', () => {
  it('counts like a tape deck', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(75.9)).toBe('1:15')
  })

  it('puts numbers on the lo-fi knob', () => {
    expect(describeLofi(0)).toMatch(/Clean signal/)
    expect(describeLofi(100)).toBe('Lowpass at 600 Hz, 24 cents of wobble, crackle at 100%.')
    expect(describeLofi(60)).toBe('Lowpass at 2.2 kHz, 14 cents of wobble, crackle at 60%.')
  })
})

describe('TapeDemo', () => {
  it('plays the playlist, moves the counter, skips, and stops', () => {
    render(<TapeDemo />)
    const tracks = screen.getAllByRole('button').filter((b) => b.closest('ol'))
    expect(tracks[0]?.getAttribute('aria-current')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(oscillators.length).toBeGreaterThan(0)
    advance(2)
    expect(screen.getByText(/^0:0[1-2] \/ 0:45$/)).toBeTruthy()
    fireEvent.change(screen.getByRole('slider', { name: /Lo-fi/ }), { target: { value: '100' } })
    expect(screen.getByText(/Lowpass at 600 Hz/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Next track' }))
    expect(tracks[1]?.getAttribute('aria-current')).toBe('true')
    fireEvent.click(tracks[2] as HTMLElement)
    expect(tracks[2]?.getAttribute('aria-current')).toBe('true')
    advance(120)
    act(() => vi.advanceTimersByTime(1))
    expect(tracks[0]?.getAttribute('aria-current')).toBe('true')
    const before = gains.length
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
    expect(gains.length).toBe(before)
  })

  it('turns the knob while stopped, and stops the tape when it leaves the page', () => {
    const { unmount } = render(<TapeDemo />)
    fireEvent.change(screen.getByRole('slider', { name: /Lo-fi/ }), { target: { value: '0' } })
    expect(screen.getByText(/Clean signal/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    const master = gains[0]
    unmount()
    expect(master?.setTargetAtTime).toHaveBeenCalledWith(0, expect.any(Number), 0.03)
  })

  it('stays stopped where Web Audio is missing', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', undefined)
    const fresh =
      await import('@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/tape-deck')
    render(<fresh.TapeDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })
})
