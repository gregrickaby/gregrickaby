import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { lofiSettings, playTape, swungStep, type TapeTrack } from '@/components/islands/tape'
import { filters, gains, instances, oscillators, stubAudio } from '@/tests/helpers/audio'

beforeEach(() => {
  stubAudio()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** Moves the audio clock and lets the sequencer's timer catch up. */
function advance(seconds: number) {
  const audio = instances.at(-1)
  if (audio) audio.currentTime += seconds
  vi.advanceTimersByTime(25)
}

/** One bar at 120 BPM, so it lasts two seconds. */
const bar: TapeTrack = { title: 'Bar', bpm: 120, swing: 0, bars: 1, texture: 'vinyl' }

/** A setup that plays one bent note on every step. */
function beeps(played: number[]) {
  return ({ audio, bend, filter }: Parameters<Parameters<typeof playTape>[4]>[0]) =>
    (step: number) => {
      played.push(step)
      const oscillator = audio.createOscillator()
      bend(oscillator)
      oscillator.connect(filter)
    }
}

describe('lo-fi settings', () => {
  it('runs from clean to worn out', () => {
    expect(lofiSettings(0)).toEqual({ cutoff: 16000, wobble: 0, crackle: 0 })
    expect(lofiSettings(1)).toEqual({ cutoff: 600, wobble: 24, crackle: 0.12 })
  })

  it('swings sixteenths long, then short', () => {
    expect(swungStep({ bpm: 60, swing: 0.5 }, 0)).toBe(0.375)
    expect(swungStep({ bpm: 60, swing: 0.5 }, 1)).toBe(0.125)
  })
})

describe('playTape', () => {
  it('plays each step through the lo-fi chain, turns the knob, and ends', () => {
    const onEnd = vi.fn()
    const heard: number[] = []
    const played: number[] = []
    const tape = playTape(bar, 0.5, (step) => heard.push(step), onEnd, beeps(played))
    const start = tape?.now() ?? 0
    expect(filters.map((f) => f.type)).toEqual(['lowpass', 'bandpass'])
    expect(filters[0]?.frequency.value).toBe(lofiSettings(0.5).cutoff)
    const note = oscillators.find((o) => o.onended)
    expect(() => note?.onended?.()).not.toThrow()
    tape?.setLofi(1)
    expect(filters[0]?.frequency.setTargetAtTime).toHaveBeenCalledWith(
      600,
      expect.any(Number),
      0.05,
    )
    advance(10)
    vi.advanceTimersByTime(1)
    expect(heard.at(-1)).toBe(15)
    expect(played).toEqual(heard)
    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(tape?.now()).toBe(start + 10)
    tape?.stop()
    vi.advanceTimersByTime(300)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it("doesn't start the next track when stopped in the last moments", () => {
    const onEnd = vi.fn()
    const tape = playTape(bar, 0.5, vi.fn(), onEnd, beeps([]))
    // One bar at 120 BPM lasts two seconds, so this books the end.
    advance(2)
    tape?.stop()
    vi.advanceTimersByTime(1000)
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('plays rain under a rainy track and turns it with the knob', () => {
    const tape = playTape({ ...bar, texture: 'rain' }, 0.5, vi.fn(), vi.fn(), beeps([]))
    const rain = gains.find((g) => g.value === lofiSettings(0.5).crackle * 0.5)
    expect(rain).toBeDefined()
    tape?.setLofi(1)
    expect(rain?.setTargetAtTime).toHaveBeenCalledWith(0.06, expect.any(Number), 0.05)
  })

  it('stays quiet where Web Audio is missing', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', undefined)
    const fresh = await import('@/components/islands/tape')
    expect(fresh.playTape(bar, 0.5, vi.fn(), vi.fn(), beeps([]))).toBeUndefined()
  })
})
