import {FilteredPostsContent} from './FilteredPostsContent'
import {PAGE_SIZE} from '@/lib/pagination'
import type {PostMeta} from '@/lib/types'
import {render, screen} from '@/test-utils'

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

vi.mock('next/navigation', () => ({
  useRouter: () => ({push: vi.fn()})
}))

const mockPosts: PostMeta[] = [
  {
    title: 'Post Alpha',
    slug: 'post-alpha',
    date: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    type: 'post'
  },
  {
    title: 'Post Beta',
    slug: 'post-beta',
    date: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    type: 'post'
  }
]

describe('FilteredPostsContent', () => {
  it('renders the title', () => {
    render(
      <FilteredPostsContent
        title="Category: Code"
        posts={mockPosts}
        page={undefined}
        baseUrl="/category/code"
      />
    )
    expect(
      screen.getByRole('heading', {name: /Category: Code/i})
    ).toBeInTheDocument()
  })

  it('renders a card for each post', () => {
    render(
      <FilteredPostsContent
        title="Tag: foo"
        posts={mockPosts}
        page={undefined}
        baseUrl="/tag/foo"
      />
    )
    expect(screen.getByText('Post Alpha')).toBeInTheDocument()
    expect(screen.getByText('Post Beta')).toBeInTheDocument()
  })

  it('shows only the first page of posts when many are provided', () => {
    const manyPosts: PostMeta[] = Array.from(
      {length: PAGE_SIZE + 1},
      (_, i) => ({
        title: `Post ${i + 1}`,
        slug: `post-${i + 1}`,
        date: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        type: 'post' as const
      })
    )
    render(
      <FilteredPostsContent
        title="Category: Photos"
        posts={manyPosts}
        page={undefined}
        baseUrl="/category/photos"
      />
    )
    expect(screen.getByText('Post 1')).toBeInTheDocument()
    expect(screen.queryByText(`Post ${PAGE_SIZE + 1}`)).not.toBeInTheDocument()
  })

  it('shows the correct page of posts when page is provided', () => {
    const manyPosts: PostMeta[] = Array.from(
      {length: PAGE_SIZE + 1},
      (_, i) => ({
        title: `Post ${i + 1}`,
        slug: `post-${i + 1}`,
        date: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        type: 'post' as const
      })
    )
    render(
      <FilteredPostsContent
        title="Tag: photos"
        posts={manyPosts}
        page="2"
        baseUrl="/tag/photos"
      />
    )
    expect(screen.getByText(`Post ${PAGE_SIZE + 1}`)).toBeInTheDocument()
    expect(screen.queryByText('Post 1')).not.toBeInTheDocument()
  })
})
