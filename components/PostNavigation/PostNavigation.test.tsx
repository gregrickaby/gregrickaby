import type {PostMeta} from '@/lib/types'
import {render, screen} from '@/test-utils'
import {PostNavigation} from './PostNavigation'

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

const prevPost: PostMeta = {
  title: 'Previous Post',
  slug: 'previous-post',
  date: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  type: 'post'
}

const nextPost: PostMeta = {
  title: 'Next Post',
  slug: 'next-post',
  date: '2024-02-01T00:00:00Z',
  modified: '2024-02-01T00:00:00Z',
  type: 'post'
}

describe('PostNavigation', () => {
  it('renders nothing when both prev and next are null', () => {
    render(<PostNavigation prev={null} next={null} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders the previous post link', () => {
    render(<PostNavigation prev={prevPost} next={null} />)
    expect(screen.getByRole('link', {name: /previous post/i})).toHaveAttribute(
      'href',
      '/previous-post'
    )
  })

  it('renders the next post link', () => {
    render(<PostNavigation prev={null} next={nextPost} />)
    expect(screen.getByRole('link', {name: /next post/i})).toHaveAttribute(
      'href',
      '/next-post'
    )
  })

  it('renders both prev and next links simultaneously', () => {
    render(<PostNavigation prev={prevPost} next={nextPost} />)
    expect(
      screen.getByRole('link', {name: /previous post/i})
    ).toBeInTheDocument()
    expect(screen.getByRole('link', {name: /next post/i})).toBeInTheDocument()
  })
})
