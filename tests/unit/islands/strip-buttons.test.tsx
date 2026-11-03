// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const playSound = vi.fn()
vi.mock('@/components/islands/sounds', () => ({ playSound }))

const { StripButtons } = await import('@/components/islands/strip-buttons')

/** Calls back once on observe, like the real one, and again on `resize()`. */
let resize = () => {}
const disconnect = vi.fn()
function stubObserver() {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: () => void) {}
      observe() {
        resize = this.callback
        this.callback()
      }
      disconnect = disconnect
    },
  )
}

afterEach(() => {
  cleanup()
  playSound.mockClear()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

/** A row 400px wide that scrolls to `scrollWidth`, with a spy on scrollBy. */
function stubRow(scrollWidth: number) {
  const row = document.createElement('div')
  row.id = 'row'
  Object.defineProperties(row, {
    clientWidth: { value: 400 },
    scrollWidth: { value: scrollWidth },
  })
  row.scrollBy = vi.fn()
  document.body.append(row)
  return row
}

const button = (name: string) => screen.queryByRole('button', { name })

describe('StripButtons', () => {
  it('renders nothing without a row, and no buttons when the row fits', () => {
    const { container } = render(<StripButtons controls="missing" label="photos" />)
    expect(container.innerHTML).toBe('')

    stubObserver()
    stubRow(400)
    render(<StripButtons controls="row" label="photos" />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows left only after scrolling, and hides right at the end', () => {
    stubObserver()
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const row = stubRow(1000)
    render(<StripButtons controls="row" label="photos" />)
    expect(button('Scroll photos left')).toBeNull()

    fireEvent.click(button('Scroll photos right')!)
    expect(row.scrollBy).toHaveBeenCalledWith({ left: 320, behavior: 'smooth' })
    expect(playSound).toHaveBeenCalledWith('step')

    row.scrollLeft = 300
    fireEvent.scroll(row)
    expect(button('Scroll photos left')?.getAttribute('aria-controls')).toBe('row')
    expect(button('Scroll photos right')).not.toBeNull()

    row.scrollLeft = 600
    fireEvent.scroll(row)
    expect(button('Scroll photos right')).toBeNull()
    expect(document.activeElement).toBe(button('Scroll photos left'))

    fireEvent.click(button('Scroll photos left')!)
    expect(row.scrollBy).toHaveBeenLastCalledWith({ left: -320, behavior: 'smooth' })
    row.scrollLeft = 0
    fireEvent.scroll(row)
    expect(document.activeElement).toBe(button('Scroll photos right'))
  })

  it('leaves focus alone when it is elsewhere', () => {
    stubObserver()
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const row = stubRow(1000)
    const elsewhere = document.createElement('input')
    document.body.append(elsewhere)
    render(<StripButtons controls="row" label="photos" />)
    fireEvent.click(button('Scroll photos right')!)
    elsewhere.focus()
    row.scrollLeft = 600
    fireEvent.scroll(row)
    expect(document.activeElement).toBe(elsewhere)

    // Reaching an end without a click moves nothing.
    elsewhere.blur()
    row.scrollLeft = 0
    fireEvent.scroll(row)
    expect(document.activeElement).toBe(document.body)
  })

  it('jumps without smooth scrolling for reduced motion, and remeasures when the row resizes', () => {
    stubObserver()
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce') }))
    const row = stubRow(1000)
    const { unmount } = render(<StripButtons controls="row" label="roles" />)

    fireEvent.click(button('Scroll roles right')!)
    expect(row.scrollBy).toHaveBeenCalledWith({ left: 320, behavior: 'auto' })

    row.scrollLeft = 300
    act(() => resize())
    expect(button('Scroll roles left')).not.toBeNull()
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('does nothing when the row is gone by the time of a click', () => {
    stubObserver()
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const row = stubRow(1000)
    render(<StripButtons controls="row" label="photos" />)
    row.remove()
    fireEvent.click(button('Scroll photos right')!)
    expect(playSound).not.toHaveBeenCalled()
  })
})
