// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ConsoleDemo,
  describePitch,
  describeRun,
  FadeDemo,
  formatNotes,
  frequency,
  HarmonicsDemo,
  heldNoise,
  NoiseDemo,
  noteName,
  NotesDemo,
  partialSquareWave,
  rollBlocks,
  ScaleDemo,
  sineWave,
  squareAt,
  stepNote,
  stoppedSine,
  toNotes,
} from '@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/demos'
import { gains, noiseBursts, oscillators, stubAudio } from '@/tests/helpers/audio'

beforeEach(() => {
  stubAudio()
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('wave helpers', () => {
  it('draws four cycles of a sine for the console demo', () => {
    const wave = sineWave()
    expect(wave).toHaveLength(240)
    expect(Math.max(...wave)).toBeCloseTo(0.8, 2)
    expect(wave[0]).toBe(0)
  })

  it('sharpens a sine toward a square as harmonics are added', () => {
    const peak = (values: number[]) => Math.max(...values)
    const quarter = (values: number[]) => values[Math.round(values.length / 16)] ?? 0
    expect(peak(partialSquareWave(1))).toBeCloseTo(0.8 * (4 / Math.PI), 2)
    expect(quarter(partialSquareWave(15))).toBeGreaterThan(quarter(partialSquareWave(1)))
  })

  it('stops a sine mid-swing, faded or not', () => {
    const cut = stoppedSine(false)
    const faded = stoppedSine(true)
    expect(cut.at(-1)).toBe(0)
    expect(Math.max(...cut.slice(150, 189).map(Math.abs))).toBeGreaterThan(0.7)
    expect(Math.max(...faded.slice(150, 189).map(Math.abs))).toBeLessThan(0.05)
  })

  it('holds picture noise for the grit, the same on every render', () => {
    const held = heldNoise(4)
    expect(held[1]).toBe(held[0])
    expect(held[4]).not.toBe(held[3])
    expect(heldNoise(4)).toEqual(held)
  })
})

describe('note helpers', () => {
  it('names pitches in scientific pitch notation', () => {
    expect(noteName(988)).toBe('B5')
    expect(noteName(440)).toBe('A4')
    expect(noteName(1047)).toBe('C6')
  })

  it('turns rows into notes, holding values to a sane range', () => {
    expect(
      toNotes([
        { id: 0, kind: 'tone', pitch: '99999', seconds: '0' },
        { id: 1, kind: 'noise', pitch: '440', seconds: 'abc' },
        { id: 2, kind: 'rest', pitch: '', seconds: '0.5' },
        { id: 3, kind: 'tone', pitch: '', seconds: '9' },
      ]),
    ).toEqual([
      [5000, 0.01],
      ['noise', 0.1],
      ['rest', 0.5],
      [440, 2],
    ])
  })

  it('writes notes the way sounds.ts does', () => {
    expect(
      formatNotes([
        [988, 0.08],
        ['rest', 0.04],
      ]),
    ).toBe("[\n  [988, 0.08],\n  ['rest', 0.04],\n]")
  })
})

describe('editor helpers', () => {
  it('steps a semitone from a note, or to the nearest note from between two', () => {
    expect(stepNote(988, 1)).toBe(1047)
    expect(stepNote(988, -1)).toBe(932)
    expect(stepNote(1000, 1)).toBe(1047)
    expect(stepNote(1000, -1)).toBe(988)
    expect(stepNote(5000, 1)).toBe(5000)
    expect(stepNote(20, -1)).toBe(20)
  })

  it('lays notes out by time and pitch, with noise on the floor and rests as gaps', () => {
    expect(
      rollBlocks([
        [440, 0.1],
        ['rest', 0.1],
        ['noise', 0.2],
      ]),
    ).toEqual([
      { kind: 'tone', width: 74, x: 0, y: 54.6 },
      null,
      { kind: 'noise', width: 149, x: 150, y: 92 },
    ])
    const [low, high] = rollBlocks([
      [20, 0.1],
      [5000, 0.1],
    ])
    expect([low?.y, high?.y]).toEqual([84, 0])
  })
})

describe('HarmonicsDemo', () => {
  it('adds harmonics, redraws, and plays them', () => {
    render(<HarmonicsDemo />)
    expect(screen.getByText(/plain sine wave/)).toBeTruthy()
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '4' } })
    expect(screen.getByRole('img', { name: 'A wave built from 4 harmonics' })).toBeTruthy()
    expect(screen.getByText('The note plus 3 odd harmonics, up to 7 times its pitch.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(oscillators[0]?.wave?.imag.length).toBe(8)
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
    fireEvent.change(slider, { target: { value: '15' } })
    expect(screen.getByText(/Close to square/)).toBeTruthy()
  })
})

describe('FadeDemo', () => {
  it('plays the same sine with and without a fade', () => {
    render(<FadeDemo />)
    const faded = within(screen.getByRole('group', { name: 'With fade' }))
    const cut = within(screen.getByRole('group', { name: 'Without fade' }))
    fireEvent.click(faded.getByRole('button', { name: 'Play' }))
    fireEvent.click(cut.getByRole('button', { name: 'Play' }))
    expect(oscillators.map((o) => o.frequency.value)).toEqual([330, 330])
    expect(oscillators.every((o) => o.wave?.imag.length === 2)).toBe(true)
    // Each play makes its output bus first, then the note's own gain.
    expect(gains[1]?.exponentialRampToValueAtTime).toHaveBeenCalled()
    expect(gains[3]?.exponentialRampToValueAtTime).not.toHaveBeenCalled()
    fireEvent.click(cut.getByRole('button', { name: 'Stop' }))
    fireEvent.click(faded.getByRole('button', { name: 'Play' }))
    fireEvent.click(faded.getByRole('button', { name: 'Stop' }))
    expect(screen.queryByRole('button', { name: 'Stop' })).toBeNull()
  })
})

describe('NoiseDemo', () => {
  it('describes and plays the chosen grit', () => {
    render(<NoiseDemo />)
    expect(screen.getByText(/smooth, fizzy static/)).toBeTruthy()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } })
    expect(screen.getByText(/lasts 8 samples.*6,000 changes a second/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    const { data } = noiseBursts[0]?.buffer as { data: Float32Array }
    expect(new Set(data).size).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })
})

describe('NotesDemo', () => {
  it('starts from the jump, shows its code, and says what to do with it', () => {
    render(<NotesDemo />)
    expect(screen.getByText(/\[330, 0\.02\],\s+\[440, 0\.02\],/)).toBeTruthy()
    expect(screen.getByText('E4')).toBeTruthy()
    expect(screen.getByText(/in the same format as/)).toBeTruthy()
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(oscillators.map((o) => [o.type, o.frequency.value])).toEqual([
      ['square', 330],
      ['square', 440],
      ['square', 587],
      ['square', 784],
    ])
    const [first, second] = screen.getAllByRole('listitem')
    expect(first?.hasAttribute('data-active')).toBe(true)
    act(() => vi.advanceTimersByTime(20))
    expect(first?.hasAttribute('data-active')).toBe(false)
    expect(second?.hasAttribute('data-active')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(second?.hasAttribute('data-active')).toBe(false)
  })

  it('edits, adds, and removes notes', () => {
    render(<NotesDemo />)
    expect(screen.getByRole('button', { name: 'Jump' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.change(screen.getByLabelText('Note 1 pitch in hertz'), { target: { value: '440' } })
    expect(screen.getByRole('button', { name: 'Jump' }).getAttribute('aria-pressed')).toBe('false')
    fireEvent.change(screen.getByLabelText('Note 2 length in seconds'), {
      target: { value: '0.2' },
    })
    fireEvent.change(screen.getByLabelText('Note 2 type'), { target: { value: 'rest' } })
    expect((screen.getByLabelText('Note 2 pitch in hertz') as HTMLInputElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Add a note' }))
    expect(
      screen.getByText(
        /\[440, 0\.02\],\s+\['rest', 0\.2\],\s+\[587, 0\.02\],\s+\[784, 0\.06\],\s+\[880, 0\.1\],/,
      ),
    ).toBeTruthy()
    for (let i = 0; i < 5; i++)
      fireEvent.click(screen.getByRole('button', { name: 'Remove note 1' }))
    expect((screen.getByRole('button', { name: 'Play' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Add a note' }))
    expect(screen.getByLabelText('Note 1 type')).toBeTruthy()
  })

  it('steps pitches by semitone and plays each change, but not typing', () => {
    render(<NotesDemo />)
    const pitch = screen.getByLabelText('Note 1 pitch in hertz') as HTMLInputElement
    fireEvent.change(pitch, { target: { value: '331' } })
    expect(pitch.value).toBe('349')
    expect(screen.getByText('F4')).toBeTruthy()
    expect(oscillators.map((o) => o.frequency.value)).toEqual([349])
    const [first] = screen.getAllByRole('listitem')
    expect(first?.hasAttribute('data-active')).toBe(true)
    expect(
      screen.getByRole('img', { name: 'A piano roll of 4 notes' }).querySelector('[data-active]'),
    ).toBeTruthy()
    fireEvent.input(pitch, { inputType: 'insertText', target: { value: '1048' } })
    expect(pitch.value).toBe('1048')
    expect(oscillators.length).toBe(1)
    fireEvent.change(pitch, { target: { value: '1047' } })
    expect(pitch.value).toBe('988')
    fireEvent.change(pitch, { target: { value: '5' } })
    fireEvent.change(pitch, { target: { value: '6' } })
    expect(pitch.value).toBe('6')
    fireEvent.change(screen.getByLabelText('Note 2 length in seconds'), {
      target: { value: '0.51' },
    })
    fireEvent.change(screen.getByLabelText('Note 2 type'), { target: { value: 'noise' } })
    expect(oscillators.length).toBe(5)
    expect(noiseBursts.length).toBe(1)
  })

  it('loads presets, and stops adding at 24 notes', () => {
    render(<NotesDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Explosion' }))
    expect(screen.getByText(/\['noise', 0\.08\],\s+\['rest', 0\.02\],/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Explosion' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(screen.getByRole('button', { name: 'Jump' }).getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: 'Power up' }))
    const add = screen.getByRole('button', { name: 'Add a note' }) as HTMLButtonElement
    for (let i = 0; i < 18; i++) fireEvent.click(add)
    expect(screen.getAllByRole('listitem').length).toBe(24)
    expect(add.disabled).toBe(true)
  })
})

describe('pitch helpers', () => {
  it('runs the formula from the post', () => {
    expect(frequency(0)).toBe(440)
    expect(frequency(3)).toBeCloseTo(523.25, 2)
    expect(frequency(12)).toBe(880)
  })

  it('draws more cycles as the pitch climbs', () => {
    const flips = (values: number[]) => values.filter((v, i) => i > 0 && v !== values[i - 1]).length
    expect(flips(squareAt(880))).toBeGreaterThan(flips(squareAt(440)))
    expect(new Set(squareAt(440))).toEqual(new Set([0.8, -0.8]))
  })

  it('names the pitch and calls out whole octaves', () => {
    expect(describePitch(3)).toBe('523.25 Hz, C5.')
    expect(describePitch(0)).toBe('440 Hz, A4. The note orchestras tune to.')
    expect(describePitch(-12)).toBe('220 Hz, A3. One octave down: exactly half of A4.')
  })
})

describe('describeRun', () => {
  it('counts the seconds, then suggests the tab', () => {
    expect(describeRun(null)).toMatch(/440 Hz sine wave/)
    expect(describeRun(1)).toBe("Playing for 1 second. It won't stop on its own.")
    expect(describeRun(30)).toBe('30 seconds and counting. Closing the tab works too.')
  })
})

describe('ConsoleDemo', () => {
  it('runs an endless sine, counts, and stops on request or when it leaves', () => {
    vi.useFakeTimers()
    const { unmount } = render(<ConsoleDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(oscillators.map((o) => [o.frequency.value, o.wave?.imag.length])).toEqual([[440, 2]])
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByText(/Playing for 2 seconds/)).toBeTruthy()
    const stop = screen.getByRole('button', { name: 'Stop' })
    expect(stop.hasAttribute('data-playing')).toBe(true)
    expect(
      screen.getByRole('img', { name: 'A sine wave at 440 Hz' }).hasAttribute('data-playing'),
    ).toBe(true)
    expect(stop.className).not.toMatch(/panic/)
    act(() => vi.advanceTimersByTime(8000))
    expect(stop.className).toMatch(/panic/)
    fireEvent.click(stop)
    expect(gains[0]?.exponentialRampToValueAtTime).toHaveBeenCalled()
    expect(screen.getByText(/at full volume/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    unmount()
    expect(gains[1]?.exponentialRampToValueAtTime).toHaveBeenCalled()
  })

  it('stays stopped where Web Audio is missing', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', undefined)
    const fresh =
      await import('@/components/islands/demos/8-bit-sound-effects-with-the-web-audio-api/demos')
    render(<fresh.ConsoleDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })
})

describe('ScaleDemo', () => {
  it('starts on C5, follows the slider, and plays the note', () => {
    render(<ScaleDemo />)
    expect(screen.getByText(/523\.25 Hz, C5/)).toBeTruthy()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '12' } })
    expect(screen.getByRole('img', { name: 'A square wave at 880 Hz' })).toBeTruthy()
    expect(screen.getByText(/exactly double A4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(oscillators.map((o) => [o.type, o.frequency.value])).toEqual([['square', 880]])
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  })
})
