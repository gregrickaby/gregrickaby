import {render, screen} from '@/test-utils'
import {PostPagination} from './PostPagination'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({push: mockPush})
}))

describe('PostPagination', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders nothing when total is 1', () => {
    render(<PostPagination total={1} current={1} />)
    expect(screen.queryByRole('button', {name: '1'})).not.toBeInTheDocument()
  })

  it('renders page buttons when total is greater than 1', () => {
    render(<PostPagination total={3} current={1} />)
    expect(screen.getByRole('button', {name: '1'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: '3'})).toBeInTheDocument()
  })

  it('marks the current page as active', () => {
    render(<PostPagination total={5} current={3} />)
    const activeButton = screen.getByRole('button', {name: '3'})
    expect(activeButton).toHaveAttribute('aria-current', 'page')
  })

  it('navigates with default baseUrl on page change', async () => {
    render(<PostPagination total={3} current={1} />)
    screen.getByRole('button', {name: '2'}).click()
    expect(mockPush).toHaveBeenCalledWith('/?page=2')
  })

  it('navigates with a custom baseUrl that has no query string', () => {
    render(<PostPagination total={3} current={1} baseUrl="/tag/photography" />)
    screen.getByRole('button', {name: '2'}).click()
    expect(mockPush).toHaveBeenCalledWith('/tag/photography?page=2')
  })

  it('navigates with a custom baseUrl that already has a query string', () => {
    render(<PostPagination total={3} current={1} baseUrl="/search?q=foo" />)
    screen.getByRole('button', {name: '2'}).click()
    expect(mockPush).toHaveBeenCalledWith('/search?q=foo&page=2')
  })
})
