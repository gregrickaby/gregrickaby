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
const contexts = vi.fn()

class FakeAudioContext {
  currentTime = 0
  destination = {}
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
  contexts.mockClear()
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
    act(() => fireEvent.click(button))
    expect(button.getAttribute('aria-pressed')).toBe('false')
    expect(oscillators.length).toBe(4)
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
