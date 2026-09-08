import {render, screen} from '@/test-utils'
import {FromArchives} from './FromArchives'

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
    title: `Archive Post ${i + 1}`,
    slug: `archive-post-${i + 1}`,
    date: '2020-01-01T00:00:00Z',
    modified: '2020-01-01T00:00:00Z',
    type: 'post' as const
  }))
}

describe('FromArchives', () => {
  it('renders the section heading', () => {
    render(<FromArchives posts={makePosts(3)} />)
    expect(
      screen.getByRole('heading', {level: 2, name: 'From The Archives'})
    ).toBeInTheDocument()
  })

  it('renders a card for each post', () => {
    render(<FromArchives posts={makePosts(3)} />)
    expect(screen.getByText('Archive Post 1')).toBeInTheDocument()
    expect(screen.getByText('Archive Post 2')).toBeInTheDocument()
    expect(screen.getByText('Archive Post 3')).toBeInTheDocument()
  })

  it('renders nothing when given an empty list', () => {
    render(<FromArchives posts={[]} />)
    expect(
      screen.queryByRole('heading', {level: 2, name: 'From The Archives'})
    ).not.toBeInTheDocument()
  })
})
