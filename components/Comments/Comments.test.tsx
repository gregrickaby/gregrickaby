import {sanitizeComment} from '@/lib/functions/sanitizeComment'
import {mockComments} from '@/mocks/mockComments'
import {render, screen} from '@testing-library/react'
import {vi} from 'vitest'
import {Comments} from './Comments'
import styles from './Comments.module.css'

// Mock the sanitizeComment function
vi.mock('@/lib/functions', () => ({
  sanitizeComment: vi.fn((content) => content),
  formatDate: (date: any) =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
      hourCycle: 'h23'
    }).format(new Date(date))
}))

describe('Comments component', () => {
  it('renders top-level comments correctly', () => {
    render(<Comments comments={mockComments} postId={123} />)
    const commentElements = screen.getAllByRole('article')

    // Check if top-level comment is rendered.
    expect(commentElements[0].classList).toContain(styles.even)
    expect(screen.getByText('Graeme')).toBeInTheDocument()
    expect(
      screen.getByText('Seriously good snippets, Greg. Gold dust! Thanks!')
    ).toBeInTheDocument()
    expect(screen.getByText('July 16, 2013 at 15:30')).toBeInTheDocument()

    // Check if second top-level comment is rendered.
    expect(screen.getByText('Tim')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Whenever I search for a fix for Genesis I always end up finding it here…Thanks Greg'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('July 30, 2013 at 10:41')).toBeInTheDocument()
  })

  it('renders author avatar and uses default alt text if no author name is provided', () => {
    render(<Comments comments={mockComments} postId={123} />)

    const avatarImage = screen.getByAltText('Graeme')
    expect(avatarImage).toHaveAttribute(
      'src',
      mockComments[0].author_avatar_urls['48']
    )

    const secondAvatar = screen.getByAltText('Tim')
    expect(secondAvatar).toHaveAttribute(
      'src',
      mockComments[1].author_avatar_urls['48']
    )
  })

  it('sanitizes the comment content', () => {
    render(<Comments comments={mockComments} postId={123} />)

    expect(sanitizeComment).toHaveBeenCalledWith(
      mockComments[0].content.rendered
    )
    expect(sanitizeComment).toHaveBeenCalledWith(
      mockComments[1].content.rendered
    )
  })

  it('renders replies correctly', () => {
    render(<Comments comments={mockComments} postId={123} />)

    // Check if the reply is rendered.
    expect(screen.getByText('Greg')).toBeInTheDocument()
    expect(
      screen.getByText('Glad it helped! Thanks for reading!')
    ).toBeInTheDocument()
    expect(screen.getByText('July 30, 2013 at 15:41')).toBeInTheDocument()
  })
})
