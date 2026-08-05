import {getPostsByCategory} from '@/lib/content'
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

const {mockPush} = vi.hoisted(() => ({mockPush: vi.fn()}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({push: mockPush}),
  notFound: vi.fn()
}))

const mockPosts: PostMeta[] = [
  {
    title: 'Code Post One',
    slug: 'code-post-one',
    date: '2024-06-01T00:00:00Z',
    modified: '2024-06-15T00:00:00Z',
    type: 'post',
    description: 'A code post',
    tags: ['snippets'],
    categories: ['Code']
  },
  {
    title: 'Code Post Two',
    slug: 'code-post-two',
    date: '2024-05-01T00:00:00Z',
    modified: '2024-05-10T00:00:00Z',
    type: 'post',
    description: 'Another code post',
    tags: ['how to'],
    categories: ['Code']
  }
]

vi.mock('@/lib/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/content')>()
  return {
    ...actual,
    getPostsByCategory: vi.fn(),
    getAllCategories: vi.fn().mockResolvedValue(['Blog', 'Code'])
  }
})

const params = Promise.resolve({category: 'Code'})
const searchParams = Promise.resolve({})

describe('Category page', () => {
  beforeEach(() => {
    vi.mocked(getPostsByCategory).mockResolvedValue(mockPosts)
  })

  it('renders posts for the category', async () => {
    const {CategoryPageContent} = await import('./page')
    render(await CategoryPageContent({params, searchParams}))
    expect(screen.getByText('Category: Code')).toBeInTheDocument()
    expect(screen.getByText('Code Post One')).toBeInTheDocument()
    expect(screen.getByText('Code Post Two')).toBeInTheDocument()
  })

  it('calls notFound when no posts match', async () => {
    vi.mocked(getPostsByCategory).mockResolvedValue([])
    const {notFound} = await import('next/navigation')
    const {CategoryPageContent} = await import('./page')
    try {
      render(await CategoryPageContent({params, searchParams}))
    } catch {
      // notFound may throw
    }
    expect(notFound).toHaveBeenCalled()
  })

  it('generates static params from all categories', async () => {
    const {generateStaticParams} = await import('./page')
    const result = await generateStaticParams()
    expect(result).toEqual(
      expect.arrayContaining([{category: 'Blog'}, {category: 'Code'}])
    )
  })

  it('generates metadata with the category name', async () => {
    const {generateMetadata} = await import('./page')
    const metadata = await generateMetadata({params, searchParams})
    expect(metadata.title).toContain('Code')
    expect(metadata.description).toContain('Code')
  })

  it('encodes a multi-word category in the canonical URL', async () => {
    const {generateMetadata} = await import('./page')
    const metadata = await generateMetadata({
      params: Promise.resolve({category: 'Web Dev'}),
      searchParams
    })
    expect(metadata.alternates?.canonical).toBe('/category/Web%20Dev')
  })

  it('encodes a multi-word category in the pagination base URL', async () => {
    const manyPosts: PostMeta[] = Array.from({length: 15}, (_, i) => ({
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      date: '2024-01-01T00:00:00Z',
      modified: '2024-01-01T00:00:00Z',
      type: 'post' as const
    }))
    vi.mocked(getPostsByCategory).mockResolvedValue(manyPosts)
    const {CategoryPageContent} = await import('./page')
    render(
      await CategoryPageContent({
        params: Promise.resolve({category: 'Web Dev'}),
        searchParams
      })
    )
    const nextPageButton = screen.getByRole('button', {name: /2/})
    nextPageButton.click()
    expect(mockPush).toHaveBeenCalledWith('/category/Web%20Dev?page=2')
  })
})
