// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  blip,
  buildPath,
  describeHeadroom,
  describeScreen,
  describeSpace,
  gainWeight,
  GamutDemo,
  HeadroomDemo,
  isFirefox,
  PAIRS,
  pairSrc,
  ScreenDemo,
  shownStops,
  toPoints,
  toY,
  WipeDemo,
} from '@/components/islands/demos/how-gain-maps-elevate-hdr-photography/demos'
import {
  area,
  chartColor,
  coverage,
  inside,
  LOCUS,
  P3_MATRIX,
  paintChart,
  SRGB_MATRIX,
} from '@/components/islands/demos/how-gain-maps-elevate-hdr-photography/gamut'
import { HDR, SDR } from '@/components/islands/demos/how-gain-maps-elevate-hdr-photography/scanline'
import { playNotes, playSound, soundEnabled } from '@/components/islands/sounds'

vi.mock('@/components/islands/sounds', () => ({
  playNotes: vi.fn(),
  playSound: vi.fn(),
  soundEnabled: vi.fn(() => true),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('blip', () => {
  it('plays a short note only when sounds are on', () => {
    blip(440)
    expect(playNotes).toHaveBeenCalledWith([[440, 0.03]])
    vi.mocked(soundEnabled).mockReturnValueOnce(false)
    blip(880)
    expect(playNotes).toHaveBeenCalledTimes(1)
  })
})

/** Stubs `matchMedia` so the given queries match, and returns a way to fire `change`. */
function stubScreen(matching: string[]) {
  const listeners = new Set<() => void>()
  const state = { matching }
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return state.matching.includes(query)
    },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }))
  return {
    listeners,
    change(next: string[]) {
      state.matching = next
      act(() => {
        for (const listener of listeners) listener()
      })
    },
  }
}

describe('screen check', () => {
  it('spots desktop Firefox but not Firefox on iOS', () => {
    expect(isFirefox('Mozilla/5.0 (Macintosh) Gecko/20100101 Firefox/140.0')).toBe(true)
    expect(isFirefox('Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 FxiOS/140.0 Mobile')).toBe(false)
  })

  it('gives a verdict for each mix of screen and browser', () => {
    expect(describeScreen(true, false)).toContain("You're all set")
    expect(describeScreen(false, false)).toContain("You'll see the SDR version")
    expect(describeScreen(true, true)).toContain('Your screen can do HDR')
    expect(describeScreen(false, true)).toContain("Firefox doesn't read gain maps yet, so")
  })

  it('shows a placeholder the same shape as the answer until the browser can answer', () => {
    const html = renderToString(<ScreenDemo />)
    expect(html).toContain('Checking your screen.')
    expect(html).toContain('Counting crayons')
    expect(html).toContain('aria-busy="true"')
  })

  it('reports an HDR, Rec. 2020 screen and updates when the screen changes', () => {
    const media = stubScreen([
      '(dynamic-range: high)',
      '(color-gamut: p3)',
      '(color-gamut: rec2020)',
    ])
    const { unmount } = render(<ScreenDemo />)
    expect(screen.getByText('Rec. 2020')).toBeTruthy()
    expect(screen.getByText(/You're all set/).parentElement!.hasAttribute('data-active')).toBe(true)
    expect(
      screen.getByText(/Checking your screen/).parentElement!.getAttribute('aria-hidden'),
    ).toBe('true')

    media.change(['(color-gamut: p3)'])
    expect(screen.getByText('Display P3')).toBeTruthy()
    expect(screen.getByText('No')).toBeTruthy()

    media.change([])
    expect(screen.getByText('sRGB only')).toBeTruthy()

    unmount()
    expect(media.listeners.size).toBe(0)
  })

  it('flags Firefox', () => {
    stubScreen([])
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Gecko/20100101 Firefox/140.0')
    render(<ScreenDemo />)
    expect(screen.getByText('Not in Firefox')).toBeTruthy()
  })
})

describe('color spaces', () => {
  it('measures each space against the visible colors', () => {
    expect(
      area([
        [0, 0],
        [1, 0],
        [0, 1],
      ]),
    ).toBe(0.5)
    expect(coverage('srgb')).toBe(34)
    expect(coverage('srgb')).toBeLessThan(coverage('p3'))
    expect(coverage('p3')).toBeLessThan(coverage('rec2020'))
    expect(describeSpace('p3')).toContain(`Display P3 covers ${coverage('p3')}% of the colors`)
  })

  it('tells the inside of the locus from the outside', () => {
    expect(inside([0.3127, 0.329], LOCUS)).toBe(true)
    expect(inside([0.7, 0.7], LOCUS)).toBe(false)
    expect(inside([0.02, 0.02], LOCUS)).toBe(false)
  })

  it('draws white at the white point and clips pure green to the screen', () => {
    expect(chartColor([0.3127, 0.329], SRGB_MATRIX)).toEqual([255, 255, 255])
    const [r, g, b] = chartColor([0.0743, 0.8338], SRGB_MATRIX)
    expect(g).toBe(255)
    expect(r + b).toBeLessThan(255)
    expect(chartColor([0.3127, 0.329], P3_MATRIX)).toEqual([255, 255, 255])
  })

  it('maps the chart onto its view box', () => {
    expect(
      toPoints([
        [0.1, 0.9],
        [0.8, 0],
      ]),
    ).toBe('100.0,0.0 800.0,900.0')
  })

  function stubCanvas(colorSpace: string) {
    const image = { data: new Uint8ClampedArray(400 * 450 * 4) }
    const context = {
      createImageData: vi.fn(() => image),
      getContextAttributes: () => ({ colorSpace }),
      putImageData: vi.fn(),
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )
    return { context, image }
  }

  it('paints the visible colors in Display P3 when the canvas allows', () => {
    const { context, image } = stubCanvas('display-p3')
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 450
    paintChart(canvas)
    expect(context.putImageData).toHaveBeenCalledWith(image, 0, 0)
    // The top left corner is outside the locus, the white point inside it.
    expect(image.data[3]).toBe(0)
    const at = (Math.round(450 * (1 - 0.329 / 0.9)) * 400 + Math.round(400 * (0.3127 / 0.8))) * 4
    expect(image.data[at + 3]).toBe(255)
  })

  it('paints in sRGB when the canvas is sRGB, and skips a canvas without a context', () => {
    const { image } = stubCanvas('srgb')
    paintChart(Object.assign(document.createElement('canvas'), { width: 400, height: 450 }))
    expect(image.data.some((value) => value > 0)).toBe(true)
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    expect(() => paintChart(document.createElement('canvas'))).not.toThrow()
  })

  it("dims everything outside the picked space and names the reader's screen", () => {
    stubCanvas('srgb')
    stubScreen(['(color-gamut: p3)'])
    render(<GamutDemo />)
    expect(screen.getByText('Your screen: Display P3')).toBeTruthy()
    expect(screen.getByRole('img', { name: /sRGB triangle/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Rec. 2020' }))
    expect(playSound).toHaveBeenCalledWith('select')
    expect(screen.getByRole('img', { name: /Rec. 2020 triangle/ })).toBeTruthy()
    expect(screen.getByText(/Rec. 2020 covers/).parentElement!.hasAttribute('data-active')).toBe(
      true,
    )
  })

  it('names a Rec. 2020 or sRGB screen, and leaves the tag off on the server', () => {
    stubCanvas('srgb')
    const media = stubScreen(['(color-gamut: p3)', '(color-gamut: rec2020)'])
    render(<GamutDemo />)
    expect(screen.getByText('Your screen: Rec. 2020')).toBeTruthy()
    media.change([])
    expect(screen.getByText('Your screen: sRGB')).toBeTruthy()
    cleanup()
    expect(renderToString(<GamutDemo />)).not.toContain('Your screen')
  })
})

describe('wipe', () => {
  it('builds the SDR and HDR file names for a pair', () => {
    expect(pairSrc(PAIRS[0]!, 'HDR')).toBe(
      '/content/posts/how-gain-maps-elevate-hdr-photography/Hollywood-Blvd-Christmas_HDR_20221205.jpg',
    )
  })

  it('loads the original files and moves the split with the handle', () => {
    render(<WipeDemo />)
    const hdr = screen.getByAltText(`${PAIRS[0]!.alt}, HDR`)
    expect(hdr.getAttribute('src')).toBe(pairSrc(PAIRS[0]!, 'HDR'))
    expect(hdr.getAttribute('style')).toContain('inset(0 0 0 50%)')

    fireEvent.change(screen.getByLabelText('Wipe between SDR and HDR'), {
      target: { value: '20' },
    })
    expect(screen.getByAltText(`${PAIRS[0]!.alt}, HDR`).getAttribute('style')).toContain(
      'inset(0 0 0 20%)',
    )
    expect(playNotes).toHaveBeenCalledWith([[600, 0.03]])
  })

  it('ticks only when the split crosses a tenth', () => {
    render(<WipeDemo />)
    fireEvent.change(screen.getByLabelText('Wipe between SDR and HDR'), {
      target: { value: '55' },
    })
    expect(playNotes).not.toHaveBeenCalled()
  })

  it('switches photos', () => {
    render(<WipeDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Castle' }))
    expect(playSound).toHaveBeenCalledWith('select')
    expect(screen.getByAltText(`${PAIRS[1]!.alt}, SDR`).getAttribute('src')).toBe(
      pairSrc(PAIRS[1]!, 'SDR'),
    )
    expect(screen.getByRole('button', { name: 'Castle' }).getAttribute('aria-pressed')).toBe('true')
    const note = screen.getByText(/the back-lit "50" on the castle/).parentElement!
    expect(note.hasAttribute('data-active')).toBe(true)
    expect(note.hasAttribute('aria-hidden')).toBe(false)
    expect(screen.getByText(/ISO 640/).parentElement!.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('headroom', () => {
  it('scales the gain map from none at 1x to all of it at the capacity', () => {
    expect(gainWeight(1)).toBe(0)
    expect(gainWeight(2)).toBeCloseTo(1 / 4.6)
    expect(gainWeight(32)).toBe(1)
  })

  it('shows the SDR row at 1x, with every bulb flat at white', () => {
    const row = shownStops(1)
    expect(row).toHaveLength(SDR.length)
    expect(Math.max(...row)).toBeCloseTo(0)
    expect(row[0]).toBeCloseTo(Math.log2(SDR[0]))
  })

  it('lifts the lights past white as headroom grows, never past the display', () => {
    const peak = HDR.indexOf(Math.max(...HDR) as (typeof HDR)[number])
    expect(shownStops(4)[peak]).toBeGreaterThan(1)
    expect(Math.max(...shownStops(4))).toBeLessThanOrEqual(2)
    expect(shownStops(16)[peak]).toBeGreaterThan(shownStops(4)[peak]!)
  })

  it('places stops on the chart, clamped to its range', () => {
    expect(toY(4.5)).toBe(0)
    expect(toY(-5)).toBe(100)
    expect(toY(9)).toBe(0)
    expect(toY(-9)).toBe(100)
    expect(buildPath([4.5, -5])).toBe('M0.0 0.0 L300.0 100.0')
  })

  it('describes SDR and HDR displays', () => {
    expect(describeHeadroom(1)).toContain('1x is SDR, like an average monitor at 250 nits')
    expect(describeHeadroom(8)).toBe(
      'At 8x, this screen can go up to 1,624 nits, about what a MacBook Pro or iPhone Pro hits for HDR. The gain map uses 65% of the boost it stores, so the bulbs climb past white and the shadows stay put.',
    )
    expect(describeHeadroom(2)).toContain('brighter than an average 250-nit monitor')
    expect(describeHeadroom(12)).toContain('brighter than a MacBook Pro')
    expect(describeHeadroom(15)).toContain('about an iPhone Pro in direct sun')
    expect(describeHeadroom(16)).toContain('brighter than an iPhone Pro in direct sun')
  })

  it('raises the screen limit and the glow as the slider moves', () => {
    const { container } = render(<HeadroomDemo />)
    const chart = container.querySelector<HTMLElement>('.chart')!
    expect(chart.style.getPropertyValue('--glow')).toBe('0')
    fireEvent.change(screen.getByRole('slider'), { target: { value: '4' } })
    expect(playNotes).toHaveBeenCalledWith([[880, 0.03]])
    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } })
    expect(screen.getByText(/At 8x/).parentElement!.hasAttribute('data-active')).toBe(true)
    expect(screen.getByText(/At 4x/).parentElement!.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByRole('img', { name: /8x headroom/ })).toBeTruthy()
    expect(Number(chart.style.getPropertyValue('--glow'))).toBeCloseTo(3 / 4.6)
    expect(screen.getByText('Screen limit').style.top).toBe(`${toY(3)}%`)
  })
})
