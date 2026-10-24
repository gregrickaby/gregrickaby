// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  FadeDemo,
  formatNotes,
  HarmonicsDemo,
  heldNoise,
  NoiseDemo,
  noteName,
  NotesDemo,
  partialSquareWave,
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
})

describe('wave helpers', () => {
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
    fireEvent.change(slider, { target: { value: '15' } })
    expect(screen.getByText(/Close to square/)).toBeTruthy()
  })
})

describe('FadeDemo', () => {
  it('plays the same sine with and without a fade', () => {
    render(<FadeDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Play with fade' }))
    fireEvent.click(screen.getByRole('button', { name: 'Play without fade' }))
    expect(oscillators.map((o) => o.frequency.value)).toEqual([330, 330])
    expect(oscillators.every((o) => o.wave?.imag.length === 2)).toBe(true)
    expect(gains[0]?.exponentialRampToValueAtTime).toHaveBeenCalled()
    expect(gains[1]?.exponentialRampToValueAtTime).not.toHaveBeenCalled()
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
  })
})

describe('NotesDemo', () => {
  it('starts from the coin and shows its code', () => {
    render(<NotesDemo />)
    expect(screen.getByText(/\[988, 0\.08\],\s+\[1319, 0\.5\],/)).toBeTruthy()
    expect(screen.getByText('B5')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(oscillators.map((o) => [o.type, o.frequency.value])).toEqual([
      ['square', 988],
      ['square', 1319],
    ])
  })

  it('edits, adds, and removes notes', () => {
    render(<NotesDemo />)
    fireEvent.change(screen.getByLabelText('Note 1 pitch in hertz'), { target: { value: '440' } })
    fireEvent.change(screen.getByLabelText('Note 2 length in seconds'), {
      target: { value: '0.2' },
    })
    fireEvent.change(screen.getByLabelText('Note 2 type'), { target: { value: 'rest' } })
    expect((screen.getByLabelText('Note 2 pitch in hertz') as HTMLInputElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Add a note' }))
    expect(screen.getByText(/\[440, 0\.08\],\s+\['rest', 0\.2\],\s+\[880, 0\.1\],/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Remove note 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove note 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove note 1' }))
    expect((screen.getByRole('button', { name: 'Play' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Add a note' }))
    expect(screen.getByLabelText('Note 1 type')).toBeTruthy()
  })

  it('loads presets, and stops adding at 24 notes', () => {
    render(<NotesDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Shutter' }))
    expect(screen.getByText(/\['noise', 0\.03\],\s+\['rest', 0\.06\],/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Fanfare' }))
    const add = screen.getByRole('button', { name: 'Add a note' }) as HTMLButtonElement
    for (let i = 0; i < 5; i++) fireEvent.click(add)
    expect(screen.getAllByRole('listitem').length).toBe(24)
    expect(add.disabled).toBe(true)
  })
})
