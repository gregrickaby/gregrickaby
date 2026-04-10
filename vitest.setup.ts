import '@testing-library/jest-dom/vitest'

// Mock server-only so tests can import server modules without throwing.
vi.mock('server-only', () => ({}))

const {getComputedStyle} = globalThis
globalThis.getComputedStyle = (elt) => getComputedStyle(elt)
globalThis.HTMLElement.prototype.scrollIntoView = () => {}

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

Object.defineProperty(document, 'fonts', {
  value: {addEventListener: vi.fn(), removeEventListener: vi.fn()}
})

class ResizeObserver {
  observe() {
    /* no-op stub */
  }
  unobserve() {
    /* no-op stub */
  }
  disconnect() {
    /* no-op stub */
  }
}

globalThis.ResizeObserver = ResizeObserver

class IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = '0px'
  readonly scrollMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = []
  observe() {
    /* no-op stub */
  }
  unobserve() {
    /* no-op stub */
  }
  disconnect() {
    /* no-op stub */
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver =
  IntersectionObserver as unknown as typeof IntersectionObserver
