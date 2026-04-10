import {getAllPosts} from '@/lib/content'
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
    title: 'First Post',
    slug: 'first-post',
    date: '2024-06-01T00:00:00Z',
    modified: '2024-06-15T00:00:00Z',
    type: 'post',
    description: 'The first post',
    categories: ['Tech']
  },
  {
    title: 'Second Post',
    slug: 'second-post',
    date: '2024-05-01T00:00:00Z',
    modified: '2024-05-10T00:00:00Z',
    type: 'post',
    description: 'The second post'
  }
]

const manyMockPosts: PostMeta[] = Array.from({length: 15}, (_, i) => ({
  title: `Post ${i + 1}`,
  slug: `post-${i + 1}`,
  date: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  type: 'post' as const
}))

vi.mock('@/lib/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/content')>()
  return {
    ...actual,
    getAllPosts: vi.fn()
  }
})

const searchParams = Promise.resolve({})

describe('Home page', () => {
  beforeEach(() => {
    vi.mocked(getAllPosts).mockReturnValue(mockPosts)
  })
  it('renders post cards', async () => {
    const {default: HomePage} = await import('./page')
    render(await HomePage({searchParams}))
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
  })

  it('renders a next link when there are more pages', async () => {
    vi.mocked(getAllPosts).mockReturnValueOnce(manyMockPosts)
    const {default: HomePage} = await import('./page')
    render(await HomePage({searchParams}))
    const nextLink = document.querySelector('link[rel="next"]')
    expect(nextLink).not.toBeNull()
    expect(nextLink?.getAttribute('href')).toContain('page=2')
  })

  it('renders a prev link on page 2', async () => {
    vi.mocked(getAllPosts).mockReturnValueOnce(manyMockPosts)
    const {default: HomePage} = await import('./page')
    render(await HomePage({searchParams: Promise.resolve({page: '2'})}))
    const prevLink = document.querySelector('link[rel="prev"]')
    expect(prevLink).not.toBeNull()
  })

  it('does not render next/prev links on a single-page site', async () => {
    const {default: HomePage} = await import('./page')
    render(await HomePage({searchParams}))
    expect(document.querySelector('link[rel="next"]')).toBeNull()
    expect(document.querySelector('link[rel="prev"]')).toBeNull()
  })
})
