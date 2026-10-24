// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Caption, Controls, DemoButton, Slider } from '@/components/islands/demo-kit/controls'
import { usePlayback } from '@/components/islands/demo-kit/playback'
import { Plot, toPath } from '@/components/islands/demo-kit/plot'
import type { Note } from '@/components/islands/sounds'
import { FakeAudioContext, stubAudio } from '@/tests/helpers/audio'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Plot', () => {
  it('draws lines, or steps that hold each value', () => {
    expect(toPath([1, 0, -1])).toBe('M0 10.0 L150.0 50.0 L300.0 90.0')
    expect(toPath([1, -1], true)).toBe('M0 10.0 H300.0 V90.0')
  })

  it('renders a labeled picture of the values', () => {
    render(<Plot label="A ramp" steps values={[1, -1]} />)
    const svg = screen.getByRole('img', { name: 'A ramp' })
    expect(svg.querySelector('path')?.getAttribute('d')).toBe('M0 10.0 H300.0 V90.0')
    expect(svg.querySelectorAll('path').length).toBe(1)
  })

  it('runs a playhead along the line while playing', () => {
    render(<Plot label="A ramp" playing values={[1, -1]} />)
    const svg = screen.getByRole('img', { name: 'A ramp' })
    expect(svg.hasAttribute('data-playing')).toBe(true)
    const [line, playhead] = svg.querySelectorAll('path')
    expect(playhead?.getAttribute('d')).toBe(line?.getAttribute('d'))
    expect(playhead?.getAttribute('class')).toBe('playhead')
  })
})

describe('controls', () => {
  it('labels a row and styles buttons by variant', () => {
    const onClick = vi.fn()
    render(
      <Controls label="Start from">
        <DemoButton onClick={onClick}>Play</DemoButton>
        <DemoButton className="extra" variant="secondary">
          Coin
        </DemoButton>
      </Controls>,
    )
    expect(screen.getByText('Start from').className).toBe('label')
    const play = screen.getByRole('button', { name: 'Play' })
    expect(play.className).toBe('button primary')
    expect(play.getAttribute('type')).toBe('button')
    expect(screen.getByRole('button', { name: 'Coin' }).className).toBe('button secondary extra')
    expect(play.querySelector('.bars')).toBeNull()
    fireEvent.click(play)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('leaves out the label when there is none', () => {
    const { container } = render(
      <Controls>
        <Caption>Note</Caption>
      </Controls>,
    )
    expect(container.querySelector('.label')).toBeNull()
    expect(screen.getByText('Note').tagName).toBe('P')
  })

  it('reports slider changes as numbers and shows the value', () => {
    const onChange = vi.fn()
    render(<Slider label="Grit" max={8} min={1} onChange={onChange} value={3} />)
    const slider = screen.getByRole('slider', { name: /Grit/ })
    fireEvent.change(slider, { target: { value: '5' } })
    expect(onChange).toHaveBeenCalledWith(5)
    expect(screen.getByText('3').tagName).toBe('OUTPUT')
  })
})

describe('playing buttons', () => {
  it('shows a play triangle that turns into equalizer bars while playing', () => {
    const { rerender } = render(<DemoButton playing={false} />)
    const button = screen.getByRole('button', { name: 'Play' })
    expect(button.querySelector('svg.icon')).toBeTruthy()
    expect(button.querySelector('.bars')).toBeNull()
    expect(button.hasAttribute('data-playing')).toBe(false)
    rerender(<DemoButton playing />)
    expect(button.textContent).toBe('Stop')
    expect(button.hasAttribute('data-playing')).toBe(true)
    expect(button.querySelectorAll('.bars span').length).toBe(3)
    expect(button.querySelector('svg')).toBeNull()
  })

  it('shows no icon on a button that plays nothing', () => {
    render(<DemoButton variant="secondary">Coin</DemoButton>)
    expect(screen.getByRole('button', { name: 'Coin' }).querySelector('svg, .bars')).toBeNull()
  })
})

const TUNE: Note[] = [
  [440, 0.1],
  ['rest', 0.2],
]

function Player() {
  const { note, play, playing } = usePlayback()
  return (
    <>
      <DemoButton onClick={() => play(TUNE)} playing={playing} />
      <output>{`Note ${note}`}</output>
    </>
  )
}

describe('usePlayback', () => {
  it('follows each note in time, starts over when played again, and goes quiet when it leaves', () => {
    stubAudio()
    vi.useFakeTimers()
    const createGain = vi.spyOn(FakeAudioContext.prototype, 'createGain')
    const { unmount } = render(<Player />)
    const button = screen.getByRole('button')
    const note = screen.getByRole('status')
    expect(note.textContent).toBe('Note -1')
    fireEvent.click(button)
    expect(note.textContent).toBe('Note 0')
    act(() => vi.advanceTimersByTime(100))
    expect(note.textContent).toBe('Note 1')
    fireEvent.click(button)
    act(() => vi.advanceTimersByTime(150))
    expect(note.textContent).toBe('Note 1')
    act(() => vi.advanceTimersByTime(150))
    expect(note.textContent).toBe('Note -1')
    expect(button.hasAttribute('data-playing')).toBe(false)
    const made = createGain.mock.calls.length
    fireEvent.click(button)
    // The first gain a play makes is the output the notes run through.
    const output = createGain.mock.results[made]?.value
    unmount()
    expect(vi.getTimerCount()).toBe(0)
    expect(output?.disconnect).toHaveBeenCalled()
  })

  it('stays still where Web Audio is missing', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', undefined)
    const fresh = await import('@/components/islands/demo-kit/playback')
    function Silent() {
      const { note, play } = fresh.usePlayback()
      return (
        <button onClick={() => play(TUNE)} type="button">
          {`Note ${note}`}
        </button>
      )
    }
    render(<Silent />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button').textContent).toBe('Note -1')
  })
})
