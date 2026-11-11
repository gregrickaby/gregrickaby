// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { playSound } from '@/components/islands/audio/sounds'
import {
  buildSystemCss,
  getTypeSystem,
} from '@/components/islands/demos/using-the-golden-ratio-and-rems/calculator'
import {
  CalculatorDemo,
  describeFluid,
  describeLineHeight,
  describeRoot,
  describeScale,
  FluidDemo,
  getResults,
  LineHeightDemo,
  RemDemo,
  ScaleDemo,
} from '@/components/islands/demos/using-the-golden-ratio-and-rems/demos'
import { DEMOS } from '@/components/islands/demos/using-the-golden-ratio-and-rems/registry'
import {
  buildClamp,
  buildScaleCss,
  formatPx,
  getFluidSize,
  getGoldenFontSize,
  getGoldenLineHeight,
  getGoldenWidth,
  getScale,
  getTunedWidth,
  PHI,
  RATIOS,
  round,
  toRem,
} from '@/components/islands/demos/using-the-golden-ratio-and-rems/scale'

vi.mock('@/components/islands/audio/sounds', () => ({ playSound: vi.fn() }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const FLUID = { min: 32, max: 56, from: 320, to: 1440 }

describe('scale math', () => {
  it('rounds and formats sizes without trailing zeros', () => {
    expect(round(1.23456)).toBe(1.235)
    expect(round(2.5, 1)).toBe(2.5)
    expect(formatPx(16)).toBe('16px')
    expect(formatPx(67.77)).toBe('67.8px')
    expect(toRem(24)).toBe('1.5rem')
    expect(toRem(24, 10)).toBe('2.4rem')
  })

  it('steps each level up or down by the ratio', () => {
    const sizes = getScale(16, PHI).map((level) => round(level.px, 1))
    expect(sizes).toEqual([67.8, 41.9, 25.9, 16, 9.9])
  })

  it('prints the scale as rem custom properties with pixel comments', () => {
    expect(buildScaleCss(16, 1.2)).toBe(
      [
        ':root {',
        '  --step-3: 1.728rem; /* 27.6px */',
        '  --step-2: 1.44rem; /* 23px */',
        '  --step-1: 1.2rem; /* 19.2px */',
        '  --step-0: 1rem; /* 16px */',
        '  --step-minus-1: 0.833rem; /* 13.3px */',
        '}',
      ].join('\n'),
    )
  })

  it('picks a line height of 1.618 at the golden width, and less on narrower lines', () => {
    expect(round(getGoldenWidth(16), 1)).toBe(670.2)
    expect(getGoldenLineHeight(16, getGoldenWidth(16)) / 16).toBeCloseTo(PHI)
    expect(round(getGoldenLineHeight(16, 300), 1)).toBe(23.2)
    expect(round(getGoldenLineHeight(17, 680) / 17)).toBe(1.587)
  })

  it('finds the font size whose golden width is a given width', () => {
    expect(getGoldenFontSize(getGoldenWidth(18))).toBeCloseTo(18)
    expect(round(getGoldenFontSize(680), 1)).toBe(16.1)
  })

  it('finds the width that keeps a whole-pixel line height golden', () => {
    expect(round(getTunedWidth(16, 26), 1)).toBe(685.3)
    expect(getTunedWidth(16, 16 * PHI)).toBeCloseTo(getGoldenWidth(16))
  })

  it('grows a fluid size between the two screens and holds it outside them', () => {
    expect(getFluidSize(FLUID, 200)).toBe(32)
    expect(round(getFluidSize(FLUID, 390), 1)).toBe(33.5)
    expect(getFluidSize(FLUID, 2000)).toBe(56)
  })

  it('builds the clamp() for a fluid size', () => {
    expect(buildClamp(FLUID)).toBe('clamp(2rem, 1.571rem + 2.143vw, 3.5rem)')
  })
})

describe('registry', () => {
  it('lists every demo the post places', () => {
    expect(Object.keys(DEMOS)).toEqual(['calculator', 'rem', 'scale', 'line-height', 'fluid'])
  })
})

describe('type scale demo', () => {
  it('renders the golden ratio scale and its CSS without JavaScript', () => {
    const html = renderToString(<ScaleDemo />)
    expect(html).toContain('h1 67.8px')
    expect(html).toContain('--step-3: 4.236rem; /* 67.8px */')
    expect(html).toContain(describeScale(16, RATIOS[0]))
  })

  it('switches ratios with a click and the body size with the slider', () => {
    render(<ScaleDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Minor third' }))
    expect(playSound).toHaveBeenCalledWith('select')
    expect(screen.getByRole('button', { name: 'Minor third' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(screen.getByText('h1 27.6px')).toBeTruthy()
    fireEvent.change(screen.getByRole('slider', { name: /Body size/ }), {
      target: { value: '20' },
    })
    expect(screen.getByText(describeScale(20, RATIOS[2]))).toBeTruthy()
  })

  it('says how much bigger the h1 is than the body', () => {
    expect(describeScale(16, RATIOS[0])).toBe(
      'Golden ratio (1.618) on a 16px body: h1 is 67.8px, 4.2 times the body.',
    )
  })
})

describe('line height demo', () => {
  it('sets the paragraph line height from the formula', () => {
    render(<LineHeightDemo />)
    const paragraph = screen.getByText(/Your eye jumps/)
    expect(parseFloat(paragraph.style.lineHeight)).toBeCloseTo(getGoldenLineHeight(16, 600))
    fireEvent.change(screen.getByRole('slider', { name: /Font size/ }), {
      target: { value: '20' },
    })
    fireEvent.change(screen.getByRole('slider', { name: /Line width/ }), {
      target: { value: '300' },
    })
    expect(paragraph.style.fontSize).toBe('20px')
    expect(parseFloat(paragraph.style.lineHeight)).toBeCloseTo(getGoldenLineHeight(20, 300))
    expect(screen.getByText(describeLineHeight(20, 300))).toBeTruthy()
  })

  it('describes the line height and the golden width', () => {
    expect(describeLineHeight(16, 670.2)).toBe(
      'Line height 25.9px (1.618 unitless). The golden width for 16px type is 670.2px.',
    )
  })
})

describe('type system', () => {
  it('works out the body, the best width and size, and the tuned width', () => {
    const system = getTypeSystem(16, 680)
    expect(round(system.lineHeight, 2)).toBe(25.96)
    expect(system.wholeLineHeight).toBe(26)
    expect(round(system.goldenWidth, 1)).toBe(670.2)
    expect(round(system.goldenSize, 1)).toBe(16.1)
    expect(round(system.tunedWidth, 1)).toBe(685.3)
  })

  it('steps headings up by half powers of the ratio, each with its own line height', () => {
    const levels = getTypeSystem(16, 680).levels.map((level) => [
      level.name,
      round(level.px, 1),
      round(level.lineHeight / level.px),
    ])
    expect(levels).toEqual([
      ['h1', 41.9, 1.355],
      ['h2', 32.9, 1.383],
      ['h3', 25.9, 1.429],
      ['h4', 20.4, 1.503],
      ['body', 16, 1.623],
      ['small', 12.6, 1.816],
    ])
  })

  it('spaces by powers of the ratio from the body line height', () => {
    const spacing = getTypeSystem(16, 680).spacing.map((step) => round(step.px, 1))
    expect(spacing).toEqual([9.9, 16, 26, 42, 68])
  })

  it('prints custom properties and the rules that use them', () => {
    const css = buildSystemCss(16, 680)
    expect(css).toContain('  --content-width: 42.5rem; /* 680px */')
    expect(css).toContain('  --text-h1: 2.618rem; /* 41.9px */')
    expect(css).toContain('  --text-body-line-height: 1.623;')
    expect(css).toContain('  --space-m: 1.623rem; /* 26px */')
    expect(css).toContain('h4 {\n  font-size: var(--text-h4);')
    expect(css).toContain('small {\n  font-size: var(--text-small);')
  })
})

describe('calculator demo', () => {
  it('shows a full result for the defaults without JavaScript', () => {
    const html = renderToString(<CalculatorDemo />)
    expect(html).toContain('26px (1.623)')
    expect(html).toContain('Width for a 26px line height')
    expect(html).toContain('Golden ratio typography')
    expect(html).toContain('--text-h1: 2.618rem;')
  })

  it('recalculates when the size and width change', () => {
    render(<CalculatorDemo />)
    fireEvent.change(screen.getByRole('slider', { name: /Font size/ }), {
      target: { value: '20' },
    })
    fireEvent.change(screen.getByRole('slider', { name: /Line width/ }), {
      target: { value: '900' },
    })
    for (const result of getResults(20, 900)) {
      expect(screen.getAllByText(result.label).length).toBeGreaterThan(0)
      expect(screen.getAllByText(result.value).length).toBeGreaterThan(0)
    }
    expect(screen.getByText(/--content-width: 56.25rem/)).toBeTruthy()
  })

  it('switches the preview typeface', () => {
    render(<CalculatorDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Serif' }))
    expect(playSound).toHaveBeenCalledWith('select')
    expect(screen.getByText(/Every paragraph has/).parentElement!.dataset.typeface).toBe('serif')
  })

  it('copies the CSS, then resets the button', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn(async () => {})
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    render(<CalculatorDemo />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy CSS' }))
    })
    expect(writeText).toHaveBeenCalledWith(buildSystemCss(16, 680))
    expect(playSound).toHaveBeenCalledWith('copy')
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy()
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByRole('button', { name: 'Copy CSS' })).toBeTruthy()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('says so when the clipboard refuses', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn(async () => Promise.reject(new Error('denied'))) },
    })
    render(<CalculatorDemo />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy CSS' }))
    })
    expect(screen.getByRole('button', { name: "Couldn't copy" })).toBeTruthy()
    vi.unstubAllGlobals()
  })

  it('labels the headline numbers', () => {
    expect(getResults(16, 680)).toEqual([
      { label: 'Line height', value: '26px (1.623)' },
      { label: 'Best width for 16px', value: '670.2px' },
      { label: 'Best size for 680px', value: '16.1px' },
      { label: 'Width for a 26px line height', value: '685.3px' },
    ])
  })
})

describe('rem demo', () => {
  it('lists px at the browser default without JavaScript', () => {
    const html = renderToString(<RemDemo />)
    expect(html).toContain('px at a <!-- -->16<!-- -->px root')
    expect(html).toContain('<td>24px</td>')
  })

  it('recomputes the table for the 62.5% preset, the slider, and the default', () => {
    render(<RemDemo />)
    fireEvent.click(screen.getByRole('button', { name: '62.5%' }))
    expect(playSound).toHaveBeenCalledWith('select')
    expect(screen.getByText('15px')).toBeTruthy()
    expect(screen.getByText(describeRoot(10))).toBeTruthy()
    fireEvent.change(screen.getByRole('slider', { name: /Root size/ }), {
      target: { value: '20' },
    })
    expect(screen.getByText('px at a 20px root')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '16px default' }))
    expect(screen.getByText(describeRoot(16))).toBeTruthy()
  })

  it('names the html rule for each root size', () => {
    expect(describeRoot(16)).toMatch(/^html \{ font-size: 100% \} is the browser default/)
    expect(describeRoot(10)).toMatch(/^html \{ font-size: 62\.5% \} makes 1rem 10px/)
    expect(describeRoot(20)).toBe('html { font-size: 125% } makes 1rem 20px.')
  })
})

describe('fluid type demo', () => {
  it('renders a phone-width column and the clamp() without JavaScript', () => {
    const html = renderToString(<FluidDemo />)
    expect(html).toContain('max-width:min(100%, 390px)')
    expect(html).toContain('clamp(2rem, 1.571rem + 2.143vw, 3.5rem)')
  })

  it('resizes the fluid headline with the screen width', () => {
    render(<FluidDemo />)
    fireEvent.change(screen.getByRole('slider', { name: /Screen width/ }), {
      target: { value: '1440' },
    })
    expect(screen.getByText(describeFluid(1440))).toBeTruthy()
    const [fixed, fluid] = screen.getAllByText('Golden ratio typography')
    expect(fixed!.style.fontSize).toBe('56px')
    expect(fluid!.style.fontSize).toBe('56px')
  })

  it('compares the fixed and fluid sizes', () => {
    expect(describeFluid(390)).toBe(
      'On a 390px screen, the fixed headline is 56px and the fluid one is 33.5px.',
    )
  })
})
