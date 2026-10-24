// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SoundToggle } from '@/components/islands/sound-toggle'
import {
  playNotes,
  playSound,
  setSoundEnabled,
  soundEnabled,
  subscribeSound,
} from '@/components/islands/sounds'
import {
  buffers,
  contexts,
  gains,
  instances,
  noiseBursts,
  oscillators,
  stubAudio,
} from '@/tests/helpers/audio'

beforeEach(() => {
  stubAudio()
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('sound setting', () => {
  it('is off until turned on, and tells subscribers', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeSound(listener)
    expect(soundEnabled()).toBe(false)
    setSoundEnabled(true)
    expect(soundEnabled()).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)
    window.dispatchEvent(new Event('storage'))
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    setSoundEnabled(false)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('treats blocked storage as off', () => {
    const blocked = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked })
    expect(() => setSoundEnabled(true)).not.toThrow()
    expect(soundEnabled()).toBe(false)
  })
})

describe('playSound', () => {
  it('stays silent while sounds are off', () => {
    playSound('copy')
    expect(contexts).not.toHaveBeenCalled()
  })

  it('plays each note as a square wave on one shared context', () => {
    setSoundEnabled(true)
    playSound('copy')
    playSound('step')
    expect(oscillators.map((o) => [o.type, o.frequency.value])).toEqual([
      ['square', 988],
      ['square', 1319],
      ['square', 880],
    ])
    expect(contexts.mock.calls.length).toBeLessThanOrEqual(1)
  })

  it('plays noise bursts from one gritty buffer and skips rests', () => {
    setSoundEnabled(true)
    playSound('shutter')
    playSound('shutter')
    expect(oscillators).toEqual([])
    expect(noiseBursts.length).toBe(4)
    expect(new Set(noiseBursts.map((n) => n.buffer)).size).toBe(1)
    const { data } = noiseBursts[0]!.buffer as { data: Float32Array }
    expect(data[0]).toBe(data[3])
    expect(buffers.mock.calls.length).toBeLessThanOrEqual(1)
  })
})

describe('playNotes', () => {
  it('plays even while sounds are off, fading each note by default', () => {
    playNotes([[440, 0.1]])
    expect(oscillators.map((o) => o.frequency.value)).toEqual([440])
    expect(gains[0]?.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 0.1)
  })

  it('cuts notes off without a fade when asked', () => {
    playNotes([[440, 0.1]], { fade: false })
    expect(gains[0]?.exponentialRampToValueAtTime).not.toHaveBeenCalled()
  })

  it('builds tones from odd harmonics at 1/n strength', () => {
    playNotes([[220, 0.1]], { harmonics: 3 })
    const [oscillator] = oscillators
    expect(oscillator?.type).toBe('')
    expect(
      [...(oscillator?.wave?.imag ?? [])].map((v) => Number((v * Math.PI).toFixed(3))),
    ).toEqual([0, 4, 0, 1.333, 0, 0.8])
  })

  it('resumes a context that started suspended, and shrugs off a refused resume', async () => {
    playNotes([[440, 0.1]])
    const audio = instances.at(-1)!
    audio.state = 'suspended'
    audio.resume.mockRejectedValueOnce(new Error('not allowed'))
    playNotes([[440, 0.1]])
    expect(audio.resume).toHaveBeenCalledTimes(1)
    await Promise.resolve()
    playNotes([[440, 0.1]])
    expect(audio.resume).toHaveBeenCalledTimes(2)
    expect(oscillators.length).toBe(3)
  })

  it('stays silent where Web Audio is missing', async () => {
    vi.resetModules()
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('no Web Audio')
        }
      },
    )
    const fresh = await import('@/components/islands/sounds')
    expect(() => fresh.playNotes([[440, 0.1]])).not.toThrow()
    expect(oscillators).toEqual([])
  })

  it('holds noise values for the given grit, with one buffer per grit', () => {
    playNotes([['noise', 0.1]], { grit: 2 })
    playNotes([['noise', 0.1]], { grit: 2 })
    const [first, second] = noiseBursts
    expect(first?.buffer).toBe(second?.buffer)
    const { data } = first?.buffer as { data: Float32Array }
    expect(data[0]).toBe(data[1])
    expect(data[1]).not.toBe(data[2])
  })
})

describe('SoundToggle', () => {
  it('turns sounds on with a jingle, then off', () => {
    render(<SoundToggle />)
    const button = screen.getByRole('button', { name: 'Sound effects' })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    act(() => fireEvent.click(button))
    expect(button.getAttribute('aria-pressed')).toBe('true')
    expect(soundEnabled()).toBe(true)
    expect(oscillators.length).toBe(4)
    expect(button.hasAttribute('data-played')).toBe(true)
    fireEvent.animationEnd(button.querySelector('path') as SVGPathElement)
    expect(button.hasAttribute('data-played')).toBe(true)
    fireEvent.animationEnd(button)
    expect(button.hasAttribute('data-played')).toBe(false)
    act(() => fireEvent.click(button))
    expect(button.getAttribute('aria-pressed')).toBe('false')
    expect(oscillators.length).toBe(4)
    expect(button.hasAttribute('data-played')).toBe(false)
  })
})

describe('SoundLink', () => {
  it('plays its sound when clicked', async () => {
    const { SoundLink } = await import('@/components/islands/sound-link')
    setSoundEnabled(true)
    render(
      <SoundLink href="#top" sound="rise">
        Top
      </SoundLink>,
    )
    fireEvent.click(screen.getByRole('link', { name: 'Top' }))
    expect(oscillators.length).toBe(5)
  })
})

describe('SoundNav', () => {
  it('ticks when a mouse enters a link, not when moving within it or on touch', async () => {
    const { SoundNav } = await import('@/components/islands/sound-nav')
    setSoundEnabled(true)
    render(
      <SoundNav aria-label="Main">
        <a href="https://example.com">
          <span>Blog</span>
        </a>
        <span>gap</span>
      </SoundNav>,
    )
    const link = screen.getByRole('link')
    const label = screen.getByText('Blog')
    fireEvent.pointerOver(link, { pointerType: 'mouse', relatedTarget: screen.getByText('gap') })
    expect(oscillators.length).toBe(1)
    fireEvent.pointerOver(label, { pointerType: 'mouse', relatedTarget: link })
    fireEvent.pointerOver(link, { pointerType: 'touch' })
    fireEvent.pointerOver(screen.getByText('gap'), { pointerType: 'mouse' })
    expect(oscillators.length).toBe(1)
  })
})

describe('SoundNav clicks', () => {
  it('ticks over buttons, and plays the click sound for links only, and only when asked to', async () => {
    const { SoundNav } = await import('@/components/islands/sound-nav')
    setSoundEnabled(true)
    render(
      <>
        <SoundNav aria-label="Tags" clickSound="select">
          <a href="#a">Moon</a>
          <span>gap</span>
        </SoundNav>
        <SoundNav aria-label="Quiet">
          <a href="#b">Quiet</a>
        </SoundNav>
        <SoundNav as="div" clickSound="select">
          <button type="button">Print</button>
        </SoundNav>
      </>,
    )
    const print = screen.getByRole('button', { name: 'Print' })
    expect(print.parentElement?.tagName).toBe('DIV')
    fireEvent.pointerOver(print, { pointerType: 'mouse' })
    expect(oscillators.length).toBe(1)
    oscillators.length = 0
    fireEvent.click(print)
    fireEvent.click(screen.getByText('gap'))
    fireEvent.click(screen.getByText('Quiet'))
    expect(oscillators.length).toBe(0)
    fireEvent.click(screen.getByText('Moon'))
    expect(oscillators.length).toBe(2)
  })
})

describe('SoundRouteLink', () => {
  it('ticks when a mouse enters, not on touch, and blips when clicked', async () => {
    const { SoundRouteLink } = await import('@/components/islands/sound-route-link')
    setSoundEnabled(true)
    render(<SoundRouteLink href="/blog">All posts</SoundRouteLink>)
    const link = screen.getByRole('link', { name: 'All posts' })
    fireEvent.pointerEnter(link, { pointerType: 'touch' })
    expect(oscillators.length).toBe(0)
    fireEvent.pointerEnter(link, { pointerType: 'mouse' })
    expect(oscillators.length).toBe(1)
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)
    expect(oscillators.map((o) => o.frequency.value)).toEqual([1175, 659, 1319])
  })
})
