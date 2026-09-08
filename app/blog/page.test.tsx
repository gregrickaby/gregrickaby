import {getAllPosts, getArchivePosts} from '@/lib/content'
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
  useRouter: () => ({push: vi.fn()}),
  notFound: vi.fn()
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
    type: 'post'
  }
]

const mockArchivePosts: PostMeta[] = [
  {
    title: 'Archive Post',
    slug: 'archive-post',
    date: '2018-01-01T00:00:00Z',
    modified: '2018-01-01T00:00:00Z',
    type: 'post'
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
    getAllPosts: vi.fn(),
    getArchivePosts: vi.fn()
  }
})

const searchParams = Promise.resolve({})

describe('Blog page', () => {
  beforeEach(() => {
    vi.mocked(getAllPosts).mockResolvedValue(mockPosts)
    vi.mocked(getArchivePosts).mockResolvedValue(mockArchivePosts)
  })

  it('renders post cards', async () => {
    const {BlogPageContent} = await import('./page')
    render(await BlogPageContent({searchParams}))
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
  })

  it('renders the "From The Archives" section on page 1', async () => {
    const {BlogPageContent} = await import('./page')
    render(await BlogPageContent({searchParams}))
    expect(
      screen.getByRole('heading', {level: 2, name: 'From The Archives'})
    ).toBeInTheDocument()
    expect(screen.getByText('Archive Post')).toBeInTheDocument()
  })

  it('does not render the "From The Archives" section on page 2', async () => {
    vi.mocked(getAllPosts).mockResolvedValueOnce(manyMockPosts)
    const {BlogPageContent} = await import('./page')
    render(await BlogPageContent({searchParams: Promise.resolve({page: '2'})}))
    expect(
      screen.queryByRole('heading', {level: 2, name: 'From The Archives'})
    ).not.toBeInTheDocument()
  })

  it('renders a next link when there are more pages', async () => {
    vi.mocked(getAllPosts).mockResolvedValueOnce(manyMockPosts)
    const {BlogPageContent} = await import('./page')
    render(await BlogPageContent({searchParams}))
    const nextLink = document.querySelector('link[rel="next"]')
    expect(nextLink).not.toBeNull()
    expect(nextLink?.getAttribute('href')).toContain('page=2')
  })

  it('renders a prev link on page 2', async () => {
    vi.mocked(getAllPosts).mockResolvedValueOnce(manyMockPosts)
    const {BlogPageContent} = await import('./page')
    render(await BlogPageContent({searchParams: Promise.resolve({page: '2'})}))
    const prevLink = document.querySelector('link[rel="prev"]')
    expect(prevLink).not.toBeNull()
  })

  it('does not render next/prev links on a single-page site', async () => {
    const {BlogPageContent} = await import('./page')
    render(await BlogPageContent({searchParams}))
    expect(document.querySelector('link[rel="next"]')).toBeNull()
    expect(document.querySelector('link[rel="prev"]')).toBeNull()
  })

  it('calls notFound when the requested page exceeds the total pages', async () => {
    const {notFound} = await import('next/navigation')
    const {BlogPageContent} = await import('./page')
    await BlogPageContent({searchParams: Promise.resolve({page: '99'})})
    expect(notFound).toHaveBeenCalled()
  })

  it('generates metadata for the blog page', async () => {
    const {generateMetadata} = await import('./page')
    const metadata = generateMetadata()
    expect(metadata.alternates?.canonical).toBe('/blog')
  })
})
