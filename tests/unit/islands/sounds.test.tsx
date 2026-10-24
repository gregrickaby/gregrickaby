// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SoundToggle } from '@/components/islands/sound-toggle'
import {
  playSound,
  setSoundEnabled,
  soundEnabled,
  subscribeSound,
} from '@/components/islands/sounds'

const oscillators: { type: string; frequency: { value: number } }[] = []
const noiseBursts: { buffer: unknown }[] = []
const contexts = vi.fn()
const buffers = vi.fn()

class FakeAudioContext {
  currentTime = 0
  destination = {}
  sampleRate = 8
  constructor() {
    contexts()
  }
  createOscillator() {
    const oscillator = {
      type: '',
      frequency: { value: 0 },
      connect: (node: unknown) => node,
      start: vi.fn(),
      stop: vi.fn(),
    }
    oscillators.push(oscillator)
    return oscillator
  }
  createBuffer() {
    buffers()
    const data = new Float32Array(8)
    return { data, getChannelData: () => data }
  }
  createBufferSource() {
    const source = { buffer: null, connect: (node: unknown) => node, start: vi.fn(), stop: vi.fn() }
    noiseBursts.push(source)
    return source
  }
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: (node: unknown) => node,
    }
  }
}

beforeEach(() => {
  vi.stubGlobal('AudioContext', FakeAudioContext)
  oscillators.length = 0
  noiseBursts.length = 0
  contexts.mockClear()
  buffers.mockClear()
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
