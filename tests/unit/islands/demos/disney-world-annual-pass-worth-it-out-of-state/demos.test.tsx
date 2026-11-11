// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { playSound } from '@/components/islands/audio/sounds'
import {
  formatDollars,
  getBreakEven,
  getBreakEvenDay,
  getPassCost,
  PASSES,
  TICKET_PER_DAY,
  type Pass,
} from '@/components/islands/demos/disney-world-annual-pass-worth-it-out-of-state/break-even'
import {
  BreakEvenDemo,
  describeBreakEven,
  MAX_DAYS,
  MAX_PEOPLE,
} from '@/components/islands/demos/disney-world-annual-pass-worth-it-out-of-state/demos'
import { DEMOS } from '@/components/islands/demos/disney-world-annual-pass-worth-it-out-of-state/registry'

vi.mock('@/components/islands/audio/sounds', () => ({ playSound: vi.fn() }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function pass(id: Pass['id']): Pass {
  const found = PASSES.find((option) => option.id === id)
  if (!found) throw new Error(`no pass ${id}`)
  return found
}

function slider(name: RegExp, value: number) {
  fireEvent.change(screen.getByRole('slider', { name }), { target: { value: String(value) } })
}

function states() {
  return screen.getAllByRole('listitem').map((day) => day.getAttribute('data-state'))
}

describe('break-even math', () => {
  it('matches the post: four people at a 4-day hopper price', () => {
    expect(getPassCost(pass('sorcerer').price, 4)).toBe(4852.14)
    expect(getPassCost(pass('incredi').price, 4)).toBe(7450.74)
    expect(getBreakEvenDay(4852.14, TICKET_PER_DAY, 4)).toBe(7)
    expect(getBreakEvenDay(7450.74, TICKET_PER_DAY, 4)).toBe(10)
    expect(getBreakEvenDay(7450.74, 188.5, 4)).toBe(10)
  })

  it('prices the two Florida resident passes', () => {
    expect(getPassCost(pass('pirate').price, 4)).toBe(3872.34)
    expect(getPassCost(pass('pixie-dust').price, 4)).toBe(2125.74)
    expect(getBreakEvenDay(3872.34, TICKET_PER_DAY, 4)).toBe(6)
    expect(getBreakEvenDay(2125.74, TICKET_PER_DAY, 4)).toBe(3)
  })

  it('reproduces the renewal break-even days in the post', () => {
    expect(getBreakEvenDay(getPassCost(969, 4), TICKET_PER_DAY, 4)).toBe(6)
    expect(getBreakEvenDay(getPassCost(1499, 4), TICKET_PER_DAY, 4)).toBe(9)
  })

  it('reproduces the 2026 row of our spreadsheet at the old $929 renewal', () => {
    expect(getPassCost(929, 4)).toBe(3957.54)
    expect(getBreakEvenDay(3957.54, 174, 4)).toBe(6)
  })

  it('works out the tickets and the savings', () => {
    const result = getBreakEven(pass('sorcerer'), 4, 12)
    expect(result.ticketCost).toBe(9072)
    expect(result.savings).toBeCloseTo(4219.86, 2)
  })

  it('formats whole dollars, with a minus sign for a loss', () => {
    expect(formatDollars(4127.94)).toBe('$4,128')
    expect(formatDollars(-647.94)).toBe('-$648')
  })
})

describe('describeBreakEven', () => {
  it('says when a group breaks even', () => {
    expect(describeBreakEven(pass('sorcerer'), 4, 12)).toBe(
      'For 4 people, the Sorcerer Pass pays for itself on day 7.',
    )
  })

  it('says when one person breaks even', () => {
    expect(describeBreakEven(pass('incredi'), 1, 5)).toBe(
      'For one person, the Incredi-Pass pays for itself on day 10.',
    )
  })
})

describe('BreakEvenDemo', () => {
  it('is in the registry under its title', () => {
    expect(DEMOS['break-even']?.title).toBe('Annual pass calculator')
    expect(DEMOS['break-even']?.Body).toBe(BreakEvenDemo)
  })

  it('renders a Sorcerer Pass for four people over 8 days without JavaScript', () => {
    const html = renderToString(<BreakEvenDemo />)
    expect(html).toContain('$4,852')
    expect(html).toContain('$6,048')
    expect(html).toContain('pays for itself on day 7')
    expect(html.match(/<li /g)).toHaveLength(MAX_DAYS)
  })

  it('marks each day as paying, free, or unused', () => {
    render(<BreakEvenDemo />)
    expect(states().slice(0, 9)).toEqual([
      ...Array(6).fill('paying'),
      ...Array(2).fill('free'),
      'unused',
    ])
    expect(screen.getByRole('listitem', { name: 'Day 1: paying off the pass' })).toBeTruthy()
    expect(screen.getByRole('listitem', { name: 'Day 7: free' })).toBeTruthy()
    expect(screen.getByRole('listitem', { name: 'Day 9: not used' })).toBeTruthy()
  })

  it('switches passes with a click and moves the break-even day', () => {
    render(<BreakEvenDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Incredi-Pass' }))
    expect(playSound).toHaveBeenCalledWith('select')
    expect(screen.getByRole('button', { name: 'Incredi-Pass' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(screen.getByText(/pays for itself on day 10/)).toBeTruthy()
    expect(states().filter((state) => state === 'paying')).toHaveLength(8)
    expect(screen.getByText('Tickets save you')).toBeTruthy()
  })

  it('lists the passes from the lowest tier to the highest, starting on Sorcerer', () => {
    render(<BreakEvenDemo />)
    const buttons = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-pressed'))
    expect(buttons.map((b) => b.textContent)).toEqual([
      'Pixie Dust',
      'Pirate',
      'Sorcerer',
      'Incredi-Pass',
    ])
    expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'false',
      'false',
      'true',
      'false',
    ])
  })

  it('offers all four passes and prices a Pixie Dust Pass', () => {
    render(<BreakEvenDemo />)
    for (const name of ['Sorcerer', 'Incredi-Pass', 'Pirate', 'Pixie Dust']) {
      expect(screen.getByRole('button', { name })).toBeTruthy()
    }
    fireEvent.click(screen.getByRole('button', { name: 'Pixie Dust' }))
    expect(screen.getByText(/pays for itself on day 3/)).toBeTruthy()
    expect(screen.getByText('$2,126')).toBeTruthy()
    expect(screen.getByText('$3,922')).toBeTruthy()
  })

  it('shows what the group saves once the pass pays off', () => {
    render(<BreakEvenDemo />)
    expect(screen.getByText('You save')).toBeTruthy()
    expect(screen.getByText('$1,196')).toBeTruthy()
  })

  it('adds and removes people with the stepper', () => {
    render(<BreakEvenDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Fewer people' }))
    fireEvent.click(screen.getByRole('button', { name: 'Fewer people' }))
    expect(screen.getByRole('status', { name: 'People' }).textContent).toBe('2')
    expect(screen.getByText(/For 2 people/)).toBeTruthy()
    expect(screen.getByText('$2,426')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'More people' }))
    expect(screen.getByText(/For 3 people/)).toBeTruthy()
  })

  it('stops the stepper at one person and at the most it prices', () => {
    render(<BreakEvenDemo />)
    const fewer = screen.getByRole('button', { name: 'Fewer people' }) as HTMLButtonElement
    const more = screen.getByRole('button', { name: 'More people' }) as HTMLButtonElement
    for (let i = 0; i < 3; i++) fireEvent.click(fewer)
    expect(screen.getByText(/For one person/)).toBeTruthy()
    expect(fewer.disabled).toBe(true)
    for (let i = 0; i < MAX_PEOPLE; i++) fireEvent.click(more)
    expect(screen.getByRole('status', { name: 'People' }).textContent).toBe(String(MAX_PEOPLE))
    expect(more.disabled).toBe(true)
  })

  it('plays a coin only when the days cross the break-even day', () => {
    render(<BreakEvenDemo />)
    slider(/Park days/, 3)
    expect(playSound).not.toHaveBeenCalled()
    slider(/Park days/, 5)
    expect(playSound).not.toHaveBeenCalled()
    slider(/Park days/, 7)
    expect(playSound).toHaveBeenCalledWith('coin')
    vi.mocked(playSound).mockClear()
    slider(/Park days/, 9)
    expect(playSound).not.toHaveBeenCalled()
  })
})
