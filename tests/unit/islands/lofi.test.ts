import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { startTape, TRACKS, type Track } from '@/components/islands/lofi'
import { noteFrequency } from '@/components/islands/sequencer'
import { lofiSettings } from '@/components/islands/tape'
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

function tokens(bar: string): string[] {
  return bar.split(' ')
}

const tiny: Track = {
  title: 'Tiny',
  bpm: 120,
  swing: 0,
  bars: 1,
  chords: ['C4 E4 X9'],
  comp: 'hold',
  chordVoice: 'rhodes',
  leadVoice: 'vibes',
  bass: ['C2 - . . . . . . . . . . . . . .'],
  lead: ['E5 . . . . . . . . . . . . . . .'],
  kick: 'x . . . . . . . . . . . . . . .',
  snare: 'x . . . . . . . . . . . . . . .',
  hat: 'x . . . . . . . . . . . . . . .',
  snareTone: [1800, 0.16],
  texture: 'vinyl',
}

describe('the playlist', () => {
  it('writes every lane in sixteen-step bars with real notes', () => {
    for (const track of TRACKS) {
      for (const bar of [...track.bass, ...track.lead, track.kick, track.snare, track.hat]) {
        expect(tokens(bar).length).toBe(16)
      }
      for (const name of track.chords.flatMap(tokens)) expect(noteFrequency(name)).toBeDefined()
    }
  })

  it('gives every track its own title', () => {
    expect(new Set(TRACKS.map((t) => t.title)).size).toBe(TRACKS.length)
  })
})

describe('startTape', () => {
  it('plays through the lo-fi chain, turns the knob, and ends', () => {
    const onEnd = vi.fn()
    const steps: number[] = []
    const tape = startTape(tiny, 0.5, (step) => steps.push(step), onEnd)
    const start = tape?.now() ?? 0
    expect(filters.map((f) => f.type)).toEqual(['lowpass', 'bandpass', 'bandpass', 'highpass'])
    expect(filters[0]?.frequency.value).toBe(lofiSettings(0.5).cutoff)
    const pitches = oscillators.map((o) => Math.round(o.frequency.value))
    expect(pitches).toEqual(expect.arrayContaining([262, 523, 330, 65, 659, 2637, 0]))
    const key = oscillators.find((o) => o.onended)
    expect(() => key?.onended?.()).not.toThrow()
    tape?.setLofi(1)
    expect(filters[0]?.frequency.setTargetAtTime).toHaveBeenCalledWith(
      600,
      expect.any(Number),
      0.05,
    )
    advance(10)
    vi.advanceTimersByTime(1)
    expect(steps.at(-1)).toBe(15)
    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(tape?.now()).toBe(start + 10)
    tape?.stop()
    vi.advanceTimersByTime(300)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })
})

describe('track styles', () => {
  it('breaks chords into eighth notes on a swelling pad, over rain', () => {
    const track: Track = {
      ...tiny,
      title: 'Arp',
      chords: ['C4 E4'],
      comp: 'arpeggio',
      chordVoice: 'pad',
      leadVoice: 'rhodes',
      bass: ['.'],
      lead: ['.'],
      kick: '.',
      snare: '.',
      hat: '.',
      snareTone: [3200, 0.05],
      texture: 'rain',
    }
    const tape = startTape(
      track,
      0.5,
      () => undefined,
      () => undefined,
    )
    advance(0.4)
    const pads = oscillators.filter((o) => o.type === 'sawtooth')
    expect(pads.map((o) => Math.round(o.frequency.value))).toEqual([262, 262, 330, 330])
    const rain = gains.find((g) => g.value === lofiSettings(0.5).crackle * 0.5)
    expect(rain).toBeDefined()
    tape?.setLofi(1)
    expect(rain?.setTargetAtTime).toHaveBeenCalledWith(0.06, expect.any(Number), 0.05)
  })
})
