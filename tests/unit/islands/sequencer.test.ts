import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  noteAt,
  noteFrequency,
  parseLane,
  startSequencer,
  toneAt,
} from '@/components/islands/sequencer'

afterEach(() => {
  vi.useRealTimers()
})

describe('noteFrequency', () => {
  it('turns note names into hertz', () => {
    expect(noteFrequency('A4')).toBe(440)
    expect(noteFrequency('C5')).toBeCloseTo(523.25, 2)
    expect(noteFrequency('F#4')).toBeCloseTo(369.99, 2)
    expect(noteFrequency('Bb3')).toBeCloseTo(233.08, 2)
  })

  it('ignores anything that is not a note', () => {
    expect(noteFrequency('k')).toBeUndefined()
    expect(noteFrequency('H2')).toBeUndefined()
  })
})

describe('lanes', () => {
  it('holds notes with dashes, stops at dots, and joins bars', () => {
    const lane = parseLane(['- C4 - . -', 'E4 - - k'])
    expect(lane.length).toBe(9)
    expect([...lane.notes.values()]).toEqual([
      { step: 1, steps: 2, token: 'C4' },
      { step: 5, steps: 3, token: 'E4' },
      { step: 8, steps: 1, token: 'k' },
    ])
  })

  it('loops, and finds the pitched notes', () => {
    const lane = parseLane(['A4 - k .'])
    expect(noteAt(lane, 6)?.token).toBe('k')
    expect(toneAt(lane, 4)).toEqual({ hz: 440, steps: 2 })
    expect(toneAt(lane, 2)).toBeUndefined()
    expect(toneAt(lane, 3)).toBeUndefined()
  })
})

describe('startSequencer', () => {
  it('books steps just ahead of the audio clock until stopped', () => {
    vi.useFakeTimers()
    const audio = { currentTime: 0 } as AudioContext
    const steps: [number, number][] = []
    const stop = startSequencer(
      audio,
      () => 0.1,
      (step, time) => steps.push([step, Number(time.toFixed(2))]),
    )
    expect(steps).toEqual([[0, 0.05]])
    Object.assign(audio, { currentTime: 0.2 })
    vi.advanceTimersByTime(25)
    expect(steps.at(-1)).toEqual([2, 0.25])
    stop()
    Object.assign(audio, { currentTime: 5 })
    vi.advanceTimersByTime(100)
    expect(steps.length).toBe(3)
  })
})
