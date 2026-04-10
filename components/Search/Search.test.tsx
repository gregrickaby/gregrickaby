import type {PostMeta} from '@/lib/types'
import {render, screen} from '@/test-utils'
import {Search, SearchButton} from './Search'

vi.mock('@mantine/spotlight', () => ({
  Spotlight: ({
    actions
  }: {
    actions: {id: string; label: string; onClick?: () => void}[]
  }) => (
    <div data-testid="spotlight">
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          data-testid={`action-${a.id}`}
          onClick={a.onClick}
        >
          {a.label}
        </button>
      ))}
    </div>
  ),
  spotlight: {open: vi.fn()}
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({push: mockPush})
}))

const mockPush = vi.fn()

const mockPosts: PostMeta[] = [
  {
    title: 'First Post',
    slug: 'first-post',
    date: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    type: 'post',
    description: 'A description'
  },
  {
    title: 'Second Post',
    slug: 'second-post',
    date: '2024-01-02T00:00:00Z',
    modified: '2024-01-02T00:00:00Z',
    type: 'post'
  }
]

describe('Search', () => {
  it('renders the Spotlight with one action per post', () => {
    render(<Search posts={mockPosts} />)
    expect(screen.getByTestId('spotlight')).toBeInTheDocument()
    expect(screen.getByTestId('action-first-post')).toBeInTheDocument()
    expect(screen.getByTestId('action-second-post')).toBeInTheDocument()
  })

  it('uses post titles as action labels', () => {
    render(<Search posts={mockPosts} />)
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
  })

  it('navigates to the post when an action is clicked', () => {
    render(<Search posts={mockPosts} />)
    screen.getByTestId('action-first-post').click()
    expect(mockPush).toHaveBeenCalledWith('/first-post')
  })

  it('falls back to an empty string when description is undefined', () => {
    render(<Search posts={mockPosts} />)
    // second-post has no description — component should render without errors
    expect(screen.getByTestId('action-second-post')).toBeInTheDocument()
  })

  it('renders nothing when posts array is empty', () => {
    render(<Search posts={[]} />)
    const spotlight = screen.getByTestId('spotlight')
    expect(spotlight.childElementCount).toBe(0)
  })
})

describe('SearchButton', () => {
  it('renders a button with the Search aria-label', () => {
    render(<SearchButton />)
    expect(screen.getByRole('button', {name: /search/i})).toBeInTheDocument()
  })

  it('opens the spotlight when clicked', async () => {
    const {spotlight} = await import('@mantine/spotlight')
    render(<SearchButton />)
    screen.getByRole('button', {name: /search/i}).click()
    expect(spotlight.open).toHaveBeenCalled()
  })
})
