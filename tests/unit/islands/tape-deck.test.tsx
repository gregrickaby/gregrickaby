// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { startTape, TRACKS } from '@/components/islands/lofi'
import { describeLofi, formatTime, nextTrack, TapeDeck } from '@/components/islands/tape-deck'
import { gains, instances, oscillators, stubAudio } from '@/tests/helpers/audio'

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

function trackButtons() {
  return screen.getAllByRole('button').filter((b) => b.closest('ol'))
}

describe('deck helpers', () => {
  it('counts like a tape deck', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(75.9)).toBe('1:15')
  })

  it('puts numbers on the lo-fi knob', () => {
    expect(describeLofi(0)).toMatch(/Clean signal/)
    expect(describeLofi(100)).toBe('Lowpass at 600 Hz, 24 cents of wobble, crackle at 100%.')
    expect(describeLofi(60)).toBe('Lowpass at 2.2 kHz, 14 cents of wobble, crackle at 60%.')
  })

  it('plays in order and wraps around at the end', () => {
    expect(nextTrack(0, 5, false)).toBe(1)
    expect(nextTrack(4, 5, false)).toBe(0)
  })

  it('shuffles to any track but the one that just played', () => {
    expect(nextTrack(2, 5, true, () => 0)).toBe(0)
    expect(nextTrack(2, 5, true, () => 0.5)).toBe(3)
    expect(nextTrack(0, 5, true, () => 0)).toBe(1)
    expect(nextTrack(4, 5, true, () => 0.999)).toBe(3)
  })
})

/** The deck on the 404 page's playlist, with or without shuffle. */
function Deck({ shuffle }: { shuffle?: boolean }) {
  return <TapeDeck shuffle={shuffle} startTape={startTape} tracks={TRACKS} />
}

describe('TapeDeck', () => {
  it('plays the playlist, moves the counter, skips, and stops', () => {
    render(<Deck />)
    expect(screen.queryByRole('button', { name: 'Shuffle' })).toBeNull()
    const tracks = trackButtons()
    expect(tracks[0]?.getAttribute('aria-current')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(oscillators.length).toBeGreaterThan(0)
    advance(2)
    expect(screen.getByText(/^0:0[1-2] \/ 1:15$/)).toBeTruthy()
    fireEvent.change(screen.getByRole('slider', { name: /Lo-fi/ }), { target: { value: '100' } })
    expect(screen.getByText(/Lowpass at 600 Hz/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Next track' }))
    expect(tracks[1]?.getAttribute('aria-current')).toBe('true')
    fireEvent.click(tracks[2] as HTMLElement)
    expect(tracks[2]?.getAttribute('aria-current')).toBe('true')
    advance(120)
    act(() => vi.advanceTimersByTime(1))
    expect(tracks[3]?.getAttribute('aria-current')).toBe('true')
    const before = gains.length
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
    expect(gains.length).toBe(before)
  })

  it('shuffles the next track and what plays after one ends', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    render(<Deck shuffle />)
    const tracks = trackButtons()
    const shuffle = screen.getByRole('button', { name: 'Shuffle' })
    fireEvent.click(shuffle)
    expect(shuffle.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Next track' }))
    expect(tracks[3]?.getAttribute('aria-current')).toBe('true')
    advance(120)
    act(() => vi.advanceTimersByTime(1))
    expect(tracks[2]?.getAttribute('aria-current')).toBe('true')
    fireEvent.click(shuffle)
    expect(shuffle.getAttribute('aria-pressed')).toBe('false')
  })

  it('turns the knob while stopped, and stops the tape when it leaves the page', () => {
    const { unmount } = render(<Deck />)
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
    const engine = await import('@/components/islands/lofi')
    const fresh = await import('@/components/islands/tape-deck')
    render(<fresh.TapeDeck startTape={engine.startTape} tracks={engine.TRACKS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })
})
