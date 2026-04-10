import {render, screen} from '@/test-utils'

const mockScrollTo = vi.fn()
let mockScrollY = 0

vi.mock('@mantine/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/hooks')>()
  return {
    ...actual,
    useWindowScroll: () => [{y: mockScrollY}, mockScrollTo]
  }
})

describe('ScrollToTop', () => {
  beforeEach(() => {
    mockScrollTo.mockClear()
  })

  it('does not render the button when scroll is below 200px', async () => {
    mockScrollY = 0
    const {ScrollToTop} = await import('./ScrollToTop')
    render(<ScrollToTop />)
    expect(
      screen.queryByRole('button', {name: 'Scroll to top'})
    ).not.toBeInTheDocument()
  })

  it('renders the button when scroll exceeds 200px', async () => {
    mockScrollY = 201
    const {ScrollToTop} = await import('./ScrollToTop')
    render(<ScrollToTop />)
    expect(
      screen.getByRole('button', {name: 'Scroll to top'})
    ).toBeInTheDocument()
  })

  it('calls scrollTo with y:0 when button is clicked', async () => {
    mockScrollY = 201
    const {userEvent} = await import('@/test-utils')
    const {ScrollToTop} = await import('./ScrollToTop')
    const user = userEvent.setup()
    render(<ScrollToTop />)
    await user.click(screen.getByRole('button', {name: 'Scroll to top'}))
    expect(mockScrollTo).toHaveBeenCalledWith({y: 0})
  })
})
