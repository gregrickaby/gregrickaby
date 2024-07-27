import BackToTop from '@/components/BackToTop'
import '@testing-library/jest-dom'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {axe} from 'jest-axe'
import {describe, expect, vi} from 'vitest'

// Mock the IconArrowUp component to avoid rendering actual SVG during tests.
vi.mock('@tabler/icons-react', () => ({
  IconArrowUp: () => <div>Icon</div>
}))

// Scroll helper function.
const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', {value: y, writable: true})
  window.dispatchEvent(new Event('scroll'))
}

describe('BackToTop Component', () => {
  beforeAll(() => {
    window.scrollTo = vi.fn() // Mock window.scrollTo method.
  })

  beforeEach(() => {
    window.scrollTo(0, 0) // Reset scroll position before each test.
  })

  it('should not render button when scroll position is less than 200', () => {
    render(<BackToTop />)
    expect(screen.queryByTestId('back-to-top')).not.toBeInTheDocument()
  })

  it('renders button when scroll position is greater than 200', async () => {
    render(<BackToTop />)

    act(() => {
      scrollTo(201)
    })

    await waitFor(() => {
      expect(screen.getByTestId('back-to-top')).toBeInTheDocument()
    })
  })

  it('scrolls to top when button is clicked', async () => {
    render(<BackToTop />)

    act(() => {
      scrollTo(201)
    })

    const button = await waitFor(() => screen.getByTestId('back-to-top'))

    act(() => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({top: 0, behavior: 'smooth'})
    })
  })

  it('button has correct aria-label and title attributes', async () => {
    render(<BackToTop />)

    act(() => {
      scrollTo(201)
    })

    const button = await waitFor(() => screen.getByTestId('back-to-top'))

    expect(button).toHaveAttribute(
      'aria-label',
      'Go back to the top of the page'
    )
    expect(button).toHaveAttribute('title', 'Go back to the top of the page')
  })

  it('should not have any accessibility issues', async () => {
    render(<BackToTop />)

    act(() => {
      scrollTo(201)
    })

    const button = await waitFor(() => screen.getByTestId('back-to-top'))
    const results = await axe(button)
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', async () => {
    const {container} = render(<BackToTop />)

    act(() => {
      scrollTo(201)
    })

    await waitFor(() => screen.getByTestId('back-to-top'))
    expect(container).toMatchSnapshot()
  })
})
