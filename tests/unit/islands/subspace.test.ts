// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { noteFrequency, parseLane } from '@/components/islands/sequencer'
import {
  buildHandshake,
  FANFARE,
  getDtmf,
  getScoreSeconds,
  startTransmission,
  VOICES,
} from '@/components/islands/subspace'
import { filters, gains, noiseBursts, oscillators, stubAudio } from '@/tests/helpers/audio'

beforeEach(() => {
  stubAudio()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('getDtmf', () => {
  it('pairs a row tone with a column tone for each key', () => {
    expect(getDtmf('1')).toEqual([697, 1209])
    expect(getDtmf('5')).toEqual([770, 1336])
    expect(getDtmf('0')).toEqual([941, 1336])
    expect(getDtmf('#')).toEqual([941, 1477])
    expect(getDtmf('D')).toEqual([941, 1633])
  })

  it('has no tones for characters off the keypad', () => {
    expect(getDtmf('-')).toBeUndefined()
  })
})

describe('buildHandshake', () => {
  it('dials each digit, then answers at 2100 Hz before the screech', () => {
    const { answer, seconds, segments } = buildHandshake('5-1')
    const tones = segments.filter((segment) => segment.kind === 'tone')
    expect(tones[0]).toMatchObject({ hz: [350, 440], start: 0 })
    expect(tones[1]).toMatchObject({ hz: [770, 1336], start: 1 })
    expect(tones[2]).toMatchObject({ hz: [697, 1209], start: 1.15 })
    expect(tones[3]).toMatchObject({ hz: [2100], start: answer })
    expect(answer).toBeCloseTo(1.6)
    expect(segments.some((segment) => segment.kind === 'hiss')).toBe(true)
    expect(segments.filter((segment) => segment.kind === 'sweep')).toHaveLength(2)
    expect(seconds).toBeGreaterThan(answer + 3)
  })

  it('dials the Enterprise by default', () => {
    const tones = buildHandshake().segments.filter((s) => s.kind === 'tone')
    // Dial tone, seven digits, answer tone, ten bursts, and the carrier.
    expect(tones).toHaveLength(20)
  })
})

describe('FANFARE', () => {
  it('runs nine bars of four beats in every voice', () => {
    for (const voice of VOICES) {
      expect(FANFARE.lanes[voice]).toHaveLength(9)
      expect(parseLane(FANFARE.lanes[voice]).length).toBe(9 * 4 * FANFARE.stepsPerBeat)
    }
    // Nine bars at 76 bpm, plus the ring of the last chord.
    expect(getScoreSeconds(FANFARE)).toBeCloseTo((9 * 4 * 60) / 76 + 2)
  })

  it('writes every pitched note as a note name', () => {
    for (const voice of VOICES.filter((voice) => voice !== 'drums')) {
      for (const note of parseLane(FANFARE.lanes[voice]).notes.values()) {
        expect(noteFrequency(note.token)).toBeTypeOf('number')
      }
    }
  })
})

describe('startTransmission', () => {
  it('books the handshake and fanfare, and reports each phase', () => {
    const onPhase = vi.fn()
    const stop = startTransmission(onPhase)
    expect(stop).toBeTypeOf('function')
    expect(onPhase).toHaveBeenLastCalledWith('dialing')
    const hz = oscillators.map((oscillator) => oscillator.frequency)
    expect(
      hz.some((param) => param.setValueAtTime.mock.calls.some(([value]) => value === 2100)),
    ).toBe(true)
    expect(oscillators.some((oscillator) => oscillator.type === 'sawtooth')).toBe(true)
    expect(filters.some((filter) => filter.type === 'bandpass')).toBe(true)
    expect(noiseBursts.length).toBeGreaterThan(1)

    vi.advanceTimersByTime(buildHandshake().answer * 1000)
    expect(onPhase).toHaveBeenLastCalledWith('handshake')
    vi.advanceTimersByTime(5000)
    expect(onPhase).toHaveBeenLastCalledWith('playing')
    vi.advanceTimersByTime(60_000)
    expect(onPhase).toHaveBeenLastCalledWith('idle')
  })

  it('hangs up early with a click and a busy signal, cancelling the phases', () => {
    const onPhase = vi.fn()
    const stop = startTransmission(onPhase)
    const booked = oscillators.length
    stop?.()
    expect(gains[0]?.setTargetAtTime).toHaveBeenCalledWith(0, 0, 0.02)
    const busy = oscillators.slice(booked).map((o) => o.frequency.setValueAtTime.mock.calls[0]?.[0])
    expect(busy).toEqual([480, 620, 480, 620, 480, 620, 480, 620])
    vi.advanceTimersByTime(90_000)
    expect(onPhase).toHaveBeenCalledTimes(1)
  })

  it('hangs up without a sound when asked to go quietly', () => {
    const stop = startTransmission(vi.fn())
    const booked = oscillators.length
    stop?.({ quietly: true })
    expect(oscillators.length).toBe(booked)
  })

  it('returns nothing where Web Audio is missing', async () => {
    vi.resetModules()
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('no Web Audio')
        }
      },
    )
    const fresh = await import('@/components/islands/subspace')
    const onPhase = vi.fn()
    expect(fresh.startTransmission(onPhase)).toBeUndefined()
    expect(onPhase).not.toHaveBeenCalled()
  })
})
