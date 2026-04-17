import {getPostsByTag} from '@/lib/content'
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
    title: 'HDR Photography',
    slug: 'hdr-photography',
    date: '2024-06-01T00:00:00Z',
    modified: '2024-06-15T00:00:00Z',
    type: 'post',
    description: 'HDR post',
    tags: ['photography', 'HDR'],
    categories: ['Blog']
  },
  {
    title: 'Moon Shot',
    slug: 'moon-shot',
    date: '2024-05-01T00:00:00Z',
    modified: '2024-05-10T00:00:00Z',
    type: 'post',
    description: 'Moon post',
    tags: ['photography', 'moon'],
    categories: ['Blog']
  }
]

vi.mock('@/lib/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/content')>()
  return {
    ...actual,
    getPostsByTag: vi.fn(),
    getAllTags: vi.fn().mockResolvedValue(['photography', 'HDR', 'moon'])
  }
})

const params = Promise.resolve({tag: 'photography'})
const searchParams = Promise.resolve({})

describe('Tag page', () => {
  beforeEach(() => {
    vi.mocked(getPostsByTag).mockResolvedValue(mockPosts)
  })

  it('renders posts for the tag', async () => {
    const {TagPageContent} = await import('./page')
    render(await TagPageContent({params, searchParams}))
    expect(screen.getByText('Tag: photography')).toBeInTheDocument()
    expect(screen.getByText('HDR Photography')).toBeInTheDocument()
    expect(screen.getByText('Moon Shot')).toBeInTheDocument()
  })

  it('calls notFound when no posts match', async () => {
    vi.mocked(getPostsByTag).mockResolvedValue([])
    const {notFound} = await import('next/navigation')
    const {TagPageContent} = await import('./page')
    try {
      render(await TagPageContent({params, searchParams}))
    } catch {
      // notFound may throw
    }
    expect(notFound).toHaveBeenCalled()
  })

  it('generates static params from all tags', async () => {
    const {generateStaticParams} = await import('./page')
    const result = await generateStaticParams()
    expect(result).toEqual(
      expect.arrayContaining([
        {tag: 'photography'},
        {tag: 'HDR'},
        {tag: 'moon'}
      ])
    )
  })

  it('generates metadata with the tag name', async () => {
    const {generateMetadata} = await import('./page')
    const metadata = await generateMetadata({params, searchParams})
    expect(metadata.title).toContain('photography')
    expect(metadata.description).toContain('photography')
  })
})
