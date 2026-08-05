import {render, screen} from '@/test-utils'
import {PostList} from './PostList'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

function makePosts(count: number) {
  return Array.from({length: count}, (_, i) => ({
    title: `Post ${i + 1}`,
    slug: `post-${i + 1}`,
    date: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    type: 'post' as const
  }))
}

describe('PostList', () => {
  it('renders nothing extra for a single post', () => {
    render(<PostList posts={makePosts(1)} />)
    expect(screen.getByText('Post 1')).toBeInTheDocument()
    expect(screen.getAllByRole('heading')).toHaveLength(1)
  })

  it('renders exactly two featured posts and no rest grid', () => {
    render(<PostList posts={makePosts(2)} />)
    expect(screen.getByText('Post 1')).toBeInTheDocument()
    expect(screen.getByText('Post 2')).toBeInTheDocument()
    expect(screen.getAllByRole('heading')).toHaveLength(2)
  })

  it('renders remaining posts in a second grid beyond the first two', () => {
    render(<PostList posts={makePosts(5)} />)
    expect(screen.getAllByRole('heading')).toHaveLength(5)
    expect(screen.getByText('Post 5')).toBeInTheDocument()
  })

  it('renders nothing when given an empty list', () => {
    render(<PostList posts={[]} />)
    expect(screen.queryAllByRole('heading')).toHaveLength(0)
  })
})
