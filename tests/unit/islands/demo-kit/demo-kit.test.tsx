// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Caption, Controls, DemoButton, Slider } from '@/components/islands/demo-kit/controls'
import { Plot, toPath } from '@/components/islands/demo-kit/plot'

afterEach(() => {
  cleanup()
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
