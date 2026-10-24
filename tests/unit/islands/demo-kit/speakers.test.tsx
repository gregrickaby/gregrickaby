// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { claimSpeakers, releaseSpeakers } from '@/components/islands/demo-kit/speakers'
import {
  ConsoleDemo,
  HarmonicsDemo,
} from '@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/demos'
import { JukeboxDemo } from '@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/jukebox'
import { TapeDemo } from '@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/tape-deck'
import { stubAudio } from '@/tests/helpers/audio'

beforeEach(() => {
  stubAudio()
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('claimSpeakers', () => {
  it('stops the last owner, but never an owner reclaiming them', () => {
    const first = {}
    const second = {}
    const stopFirst = vi.fn()
    claimSpeakers(first, stopFirst)
    claimSpeakers(first, stopFirst)
    expect(stopFirst).not.toHaveBeenCalled()
    claimSpeakers(second, vi.fn())
    expect(stopFirst).toHaveBeenCalledTimes(1)
    releaseSpeakers(first)
    const stopThird = vi.fn()
    claimSpeakers({}, stopThird)
    releaseSpeakers(second)
    claimSpeakers({}, vi.fn())
    expect(stopThird).toHaveBeenCalledTimes(1)
  })
})

describe('one demo at a time', () => {
  it('stops the jukebox when the tape starts, and the tape when a short demo plays', () => {
    render(
      <>
        <JukeboxDemo />
        <TapeDemo />
        <HarmonicsDemo />
        <ConsoleDemo />
      </>,
    )
    const [jukebox, tape, harmonics, console] = screen.getAllByRole('button', {
      name: 'Play',
    }) as HTMLElement[]
    const label = (button: HTMLElement | undefined) => button?.textContent
    fireEvent.click(jukebox as HTMLElement)
    expect(label(jukebox)).toBe('Stop')
    fireEvent.click(tape as HTMLElement)
    expect([label(jukebox), label(tape)]).toEqual(['Play', 'Stop'])
    expect(screen.queryByRole('switch', { name: /Drums/ })).toBeTruthy()
    fireEvent.click(harmonics as HTMLElement)
    expect([label(tape), label(harmonics)]).toEqual(['Play', 'Stop'])
    fireEvent.click(console as HTMLElement)
    expect([label(harmonics), label(console)]).toEqual(['Play', 'Stop'])
    act(() => vi.advanceTimersByTime(1000))
    fireEvent.click(harmonics as HTMLElement)
    expect(label(console)).toBe('Play')
  })
})
