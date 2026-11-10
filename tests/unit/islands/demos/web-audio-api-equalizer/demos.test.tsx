// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  barLabels,
  BarsDemo,
  describeSmoothing,
  EqDemo,
  GhostDemo,
  KnobDemo,
  matchPreset,
  SmoothingDemo,
} from '@/components/islands/demos/web-audio-api-equalizer/demos'
import { PRESETS } from '@/components/islands/demos/web-audio-api-equalizer/equalizer'
import { buildChain, drawBars } from '@/components/islands/demos/web-audio-api-equalizer/player'
import {
  analyserLevel,
  connections,
  FakeAudioContext,
  filters,
  gains,
  instances,
  stubAudio,
} from '@/tests/helpers/audio'

function fakeCanvasContext() {
  return { clearRect: vi.fn(), fillRect: vi.fn(), fillStyle: '' }
}

let canvasContext: ReturnType<typeof fakeCanvasContext>

beforeEach(() => {
  stubAudio()
  vi.useFakeTimers()
  canvasContext = fakeCanvasContext()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    canvasContext as unknown as CanvasRenderingContext2D,
  )
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

function play() {
  fireEvent.click(screen.getByRole('button', { name: 'Play' }))
}

function stop() {
  fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
}

describe('buildChain', () => {
  it('runs the preamp through each filter, then the analyser, then the speakers', () => {
    const audio = new FakeAudioContext() as unknown as AudioContext
    const chain = buildChain(
      audio,
      [{ type: 'peaking', frequency: 1000, gain: 6, q: 1.4 }],
      -6,
      0.5,
    )
    expect(chain.input.gain.value).toBeCloseTo(0.5, 1)
    expect(filters[0]?.gain.value).toBe(6)
    expect(chain.analyser.smoothingTimeConstant).toBe(0.5)
    expect(connections.map(([from, to]) => [from, to])).toEqual([
      [chain.input, chain.filters[0]],
      [chain.filters[0], chain.analyser],
      [chain.analyser, audio.destination],
    ])
    chain.disconnect()
    expect(chain.analyser.disconnect).toHaveBeenCalled()
  })
})

describe('drawBars', () => {
  it('skips a missing canvas or one without a 2D context', () => {
    drawBars(null, [1])
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    drawBars(document.createElement('canvas'), [1])
    expect(canvasContext.clearRect).not.toHaveBeenCalled()
  })

  it('draws a bar per level, up from the bottom', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 50
    drawBars(canvas, [1, 0.5])
    expect(canvasContext.fillRect).toHaveBeenCalledWith(2, 0, 46, 50)
    expect(canvasContext.fillRect).toHaveBeenCalledWith(52, 25, 46, 25)
  })
})

describe('labels and captions', () => {
  it('labels bars by octave band or by where each even slice starts', () => {
    expect(barLabels('octaves')[5]).toBe('1k')
    expect(barLabels('even').slice(0, 3)).toEqual(['0', '2.4k', '4.8k'])
  })

  it('describes each range of smoothing', () => {
    expect(describeSmoothing(0)).toMatch(/twitch/)
    expect(describeSmoothing(50)).toMatch(/beat/)
    expect(describeSmoothing(80)).toMatch(/default/)
    expect(describeSmoothing(95)).toMatch(/Syrup/)
  })

  it('names the preset the sliders match', () => {
    expect(matchPreset(PRESETS.Telephone as number[])).toBe('Telephone')
    expect(matchPreset([1, 2, 3])).toBeUndefined()
  })
})

describe('BarsDemo', () => {
  it('draws the song, mutes parts, and switches spacing', () => {
    analyserLevel.value = 0.5
    render(<BarsDemo />)
    expect(screen.getByText(/Even: every bar/)).toBeTruthy()
    play()
    advance(0.1)
    expect(canvasContext.fillRect).toHaveBeenCalled()
    const drums = screen.getByRole('button', { name: 'Drums' })
    fireEvent.click(drums)
    expect(drums.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(drums)
    expect(drums.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Octaves' }))
    expect(screen.getByText(/Octaves: every bar/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Even' }))
    stop()
    act(() => vi.advanceTimersByTime(300))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })

  it('stops when another demo starts', () => {
    render(
      <>
        <BarsDemo />
        <SmoothingDemo />
      </>,
    )
    const [first, second] = screen.getAllByRole('button', { name: 'Play' })
    fireEvent.click(first as HTMLElement)
    fireEvent.click(second as HTMLElement)
    expect(screen.getAllByRole('button', { name: 'Play' })).toHaveLength(1)
  })
})

describe('SmoothingDemo', () => {
  it('changes the smoothing while the song plays', () => {
    render(<SmoothingDemo />)
    play()
    fireEvent.change(screen.getByRole('slider', { name: /Smoothing/ }), {
      target: { value: '10' },
    })
    expect(screen.getByText(/twitch/)).toBeTruthy()
    expect(screen.getByText('0.10')).toBeTruthy()
  })
})

describe('KnobDemo', () => {
  it('moves the filter while the song plays and describes it', () => {
    render(<KnobDemo />)
    expect(screen.getByText(/Boosting 12 dB around 704 Hz/)).toBeTruthy()
    play()
    fireEvent.change(screen.getByRole('slider', { name: /Frequency/ }), {
      target: { value: '0' },
    })
    expect(filters[0]?.frequency.setTargetAtTime).toHaveBeenCalledWith(31, expect.any(Number), 0.02)
    fireEvent.change(screen.getByRole('slider', { name: /Gain/ }), { target: { value: '-6' } })
    expect(screen.getByText('Cutting 6 dB around 31 Hz.')).toBeTruthy()
    fireEvent.change(screen.getByRole('slider', { name: /Gain/ }), { target: { value: '0' } })
    expect(screen.getByText(/does nothing/)).toBeTruthy()
  })
})

describe('EqDemo', () => {
  it('loads presets, moves bands, and warns about clipping until the preamp comes down', () => {
    render(<EqDemo />)
    expect(screen.getByText('Preset: Flat.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Bass boost' }))
    expect(screen.getByText('Preset: Bass boost.')).toBeTruthy()
    fireEvent.change(screen.getByRole('slider', { name: '1 kHz band' }), { target: { value: '3' } })
    expect(screen.getByText('Your own curve.')).toBeTruthy()
    play()
    analyserLevel.value = 1.5
    advance(0.1)
    expect(screen.getByText(/Clipping!/)).toBeTruthy()
    fireEvent.change(screen.getByRole('slider', { name: /Preamp/ }), { target: { value: '-12' } })
    const preamp = gains.find((gain) => gain.setTargetAtTime.mock.calls.length > 0)
    expect(preamp).toBeTruthy()
    analyserLevel.value = 0.5
    advance(0.1)
    expect(screen.queryByText(/Clipping!/)).toBeNull()
    stop()
  })
})

describe('GhostDemo', () => {
  it('cuts the melody bands and brings the band back in', () => {
    render(<GhostDemo />)
    expect(screen.getByText(/uncut/)).toBeTruthy()
    play()
    fireEvent.click(screen.getByRole('button', { name: /Cut 500 Hz/ }))
    expect(screen.getByText(/the ghost/)).toBeTruthy()
    expect(filters[5]?.gain.setTargetAtTime).toHaveBeenCalledWith(-24, expect.any(Number), 0.02)
    const alone = screen.getByRole('button', { name: 'Melody alone' })
    fireEvent.click(alone)
    expect(alone.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(alone)
    expect(alone.getAttribute('aria-pressed')).toBe('true')
  })
})

describe('without Web Audio', () => {
  it('stays stopped', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', undefined)
    const fresh = await import('@/components/islands/demos/web-audio-api-equalizer/demos')
    render(<fresh.SmoothingDemo />)
    play()
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })
})
