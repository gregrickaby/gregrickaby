import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CHANNELS,
  pulseTerms,
  SONG,
  startChiptune,
  type Song,
} from '@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/chiptune'
import {
  lofiSettings,
  startTape,
  swungStep,
  TRACKS,
  type Track,
} from '@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/lofi'
import { noteFrequency } from '@/components/islands/sequencer'
import {
  filters,
  gains,
  instances,
  noiseBursts,
  oscillators,
  stubAudio,
} from '@/tests/helpers/audio'

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

describe('the song', () => {
  it('has sixteen bars of sixteen steps on every channel', () => {
    for (const channel of CHANNELS) {
      expect(SONG.lanes[channel].length).toBe(16)
      for (const bar of SONG.lanes[channel]) expect(tokens(bar).length).toBe(16)
    }
  })

  it('only uses real notes and known drums', () => {
    for (const channel of ['pulse1', 'pulse2', 'triangle'] as const) {
      for (const token of SONG.lanes[channel].flatMap(tokens)) {
        if (token !== '-' && token !== '.') expect(noteFrequency(token)).toBeDefined()
      }
    }
    const drums = new Set(SONG.lanes.noise.flatMap(tokens))
    expect([...drums].sort()).toEqual(['-', '.', 'h', 'k', 's'].filter((t) => drums.has(t)))
  })
})

describe('pulseTerms', () => {
  it('builds a 50% pulse from odd sine terms, like a square wave', () => {
    const { real, imag } = pulseTerms(0.5, 4)
    expect([...real].map((v) => Math.abs(Number(v.toFixed(3))))).toEqual([0, 0, 0, 0, 0])
    expect([...imag].map((v) => Number((v * Math.PI).toFixed(3)))).toEqual([0, 2, 0, 0.667, 0])
  })
})

describe('startChiptune', () => {
  it('plays all four channels, mutes them, and stops', () => {
    const steps: number[] = []
    const song = startChiptune(
      SONG,
      () => 150,
      (step) => steps.push(step),
    )
    expect(steps).toEqual([0])
    expect(oscillators.map((o) => Number(o.frequency.value.toFixed(0)))).toEqual([659, 262, 131])
    expect(oscillators[0]?.wave?.imag.length).toBe(33)
    expect(oscillators[2]?.type).toBe('triangle')
    expect(noiseBursts.length).toBe(1)
    song?.setMuted('triangle', true)
    song?.setMuted('triangle', false)
    expect(song?.analysers.noise.fftSize).toBe(1024)
    expect(song?.now()).toBe(0)
    advance(0.2)
    expect(steps.length).toBeGreaterThan(2)
    const master = gains[0]
    song?.stop()
    expect(master?.setTargetAtTime).toHaveBeenCalledWith(0, 0.2, 0.02)
    vi.advanceTimersByTime(300)
  })

  it('skips tokens it does not know', () => {
    const odd: Song = {
      title: 'Odd',
      bpm: 120,
      lanes: { pulse1: ['Q9'], pulse2: ['.'], triangle: ['.'], noise: ['z'] },
    }
    startChiptune(
      odd,
      () => 120,
      () => undefined,
    )
    expect(oscillators).toEqual([])
    expect(noiseBursts).toEqual([])
  })

  it('stays silent where Web Audio is missing', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', undefined)
    const fresh =
      await import('@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/chiptune')
    expect(
      fresh.startChiptune(
        SONG,
        () => 150,
        () => undefined,
      ),
    ).toBeUndefined()
    const lofi =
      await import('@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/lofi')
    expect(
      lofi.startTape(
        TRACKS[0] as Track,
        0.5,
        () => undefined,
        () => undefined,
      ),
    ).toBeUndefined()
  })
})

describe('the playlist', () => {
  it('writes every lane in sixteen-step bars with real notes', () => {
    for (const track of TRACKS) {
      for (const bar of [...track.bass, ...track.lead, track.kick, track.snare, track.hat]) {
        expect(tokens(bar).length).toBe(16)
      }
      for (const name of track.chords.flatMap(tokens)) expect(noteFrequency(name)).toBeDefined()
    }
  })
})

describe('lo-fi settings', () => {
  it('runs from clean to worn out', () => {
    expect(lofiSettings(0)).toEqual({ cutoff: 16000, wobble: 0, crackle: 0 })
    expect(lofiSettings(1)).toEqual({ cutoff: 600, wobble: 24, crackle: 0.12 })
  })

  it('swings sixteenths long, then short', () => {
    const track = { bpm: 60, swing: 0.5 } as Track
    expect(swungStep(track, 0)).toBe(0.375)
    expect(swungStep(track, 1)).toBe(0.125)
  })
})

describe('startTape', () => {
  const tiny: Track = {
    title: 'Tiny',
    bpm: 120,
    swing: 0,
    bars: 1,
    chords: ['C4 E4 X9'],
    comp: 'eighths',
    leadDuty: 0.25,
    chordDuty: 0.125,
    bass: ['C2 - . . . . . . . . . . . . . .'],
    lead: ['E5 . . . . . . . . . . . . . . .'],
    kick: 'x . . . . . . . . . . . . . . .',
    snare: 'x . . . . . . . . . . . . . . .',
    hat: 'x . . . . . . . . . . . . . . .',
    snareTone: [3, 0.12],
    texture: 'vinyl',
  }

  it('plays through the lo-fi chain, turns the knob, and ends', () => {
    const onEnd = vi.fn()
    const steps: number[] = []
    const tape = startTape(tiny, 0.5, (step) => steps.push(step), onEnd)
    const start = tape?.now() ?? 0
    expect(filters.map((f) => f.type)).toEqual(['lowpass', 'bandpass'])
    expect(filters[0]?.frequency.value).toBe(lofiSettings(0.5).cutoff)
    const pitches = oscillators.map((o) => Math.round(o.frequency.value))
    expect(pitches).toEqual(expect.arrayContaining([262, 65, 659, 0]))
    expect(oscillators.find((o) => Math.round(o.frequency.value) === 65)?.type).toBe('triangle')
    expect(oscillators.find((o) => Math.round(o.frequency.value) === 659)?.wave).not.toBeNull()
    // The crackle, the rain, and a kick, snare, and hi-hat from the noise channel
    expect(noiseBursts.length).toBe(5)
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

describe('stopping a tape', () => {
  it("doesn't start the next track once the reader stops in the last moments", () => {
    const onEnd = vi.fn()
    const track = { ...TRACKS[0], bars: 1, bpm: 120 } as Track
    const tape = startTape(track, 0.5, () => undefined, onEnd)
    // One bar at 120 BPM lasts two seconds, so this books the end.
    advance(2)
    tape?.stop()
    vi.advanceTimersByTime(1000)
    expect(onEnd).not.toHaveBeenCalled()
  })
})

describe('track styles', () => {
  it('rolls through chords every sixteenth, over rain', () => {
    const track: Track = {
      title: 'Arp',
      bpm: 120,
      swing: 0,
      bars: 1,
      chords: ['C4 E4'],
      comp: 'sixteenths',
      leadDuty: 0.5,
      chordDuty: 0.125,
      bass: ['.'],
      lead: ['.'],
      kick: '.',
      snare: '.',
      hat: '.',
      snareTone: [1, 0.04],
      texture: 'rain',
    }
    const tape = startTape(
      track,
      0.5,
      () => undefined,
      () => undefined,
    )
    advance(0.4)
    const pulses = oscillators.filter((o) => o.wave)
    expect(pulses.map((o) => Math.round(o.frequency.value))).toEqual([262, 330, 262, 330])
    const rain = gains.find((g) => g.value === lofiSettings(0.5).crackle * 0.5)
    expect(rain).toBeDefined()
    tape?.setLofi(1)
    expect(rain?.setTargetAtTime).toHaveBeenCalledWith(0.06, expect.any(Number), 0.05)
  })

  it('rests pulse 2 through a chord with no real notes', () => {
    const track = { ...TRACKS[0], bars: 1, chords: ['X9'], bass: ['.'], lead: ['.'] } as Track
    startTape(
      track,
      0.5,
      () => undefined,
      () => undefined,
    )
    advance(0.4)
    expect(oscillators.filter((o) => o.wave)).toEqual([])
  })
})
