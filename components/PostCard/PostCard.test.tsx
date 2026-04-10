import {render, screen, within} from '@/test-utils'
import {PostCard} from './PostCard'

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

const post = {
  title: 'My Test Post',
  slug: 'my-test-post',
  date: '2024-06-01T00:00:00Z',
  modified: '2024-06-01T00:00:00Z',
  type: 'post' as const,
  description: 'A short description of the post.',
  categories: ['JavaScript', 'Testing'],
  featuredImage: './hero.jpg'
}

describe('PostCard', () => {
  it('renders the post title as a link', () => {
    render(<PostCard post={post} />)
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'My Test Post'
    })
    const link = within(heading).getByRole('link')
    expect(link).toHaveAttribute('href', '/my-test-post')
  })

  it('renders the description', () => {
    render(<PostCard post={post} />)
    expect(
      screen.getByText('A short description of the post.')
    ).toBeInTheDocument()
  })

  it('renders the featured image', () => {
    render(<PostCard post={post} />)
    expect(screen.getByAltText('My Test Post')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const minimal = {
      title: 'Minimal',
      slug: 'minimal',
      date: '2024-01-01T00:00:00Z',
      modified: '2024-01-01T00:00:00Z',
      type: 'post' as const
    }
    render(<PostCard post={minimal} />)
    expect(screen.getByText('Minimal')).toBeInTheDocument()
    expect(screen.queryByAltText('Minimal')).not.toBeInTheDocument()
  })
})
