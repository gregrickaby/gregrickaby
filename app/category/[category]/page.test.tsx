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

vi.mock('next/navigation', () => ({
  useRouter: () => ({push: vi.fn()}),
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
    getAllCategories: vi.fn(() => ['Blog', 'Code'])
  }
})

const params = Promise.resolve({category: 'Code'})
const searchParams = Promise.resolve({})

describe('Category page', () => {
  beforeEach(() => {
    vi.mocked(getPostsByCategory).mockReturnValue(mockPosts)
  })

  it('renders posts for the category', async () => {
    const {default: CategoryPage} = await import('./page')
    render(await CategoryPage({params, searchParams}))
    expect(screen.getByText('Category: Code')).toBeInTheDocument()
    expect(screen.getByText('Code Post One')).toBeInTheDocument()
    expect(screen.getByText('Code Post Two')).toBeInTheDocument()
  })

  it('calls notFound when no posts match', async () => {
    vi.mocked(getPostsByCategory).mockReturnValue([])
    const {notFound} = await import('next/navigation')
    const {default: CategoryPage} = await import('./page')
    try {
      render(await CategoryPage({params, searchParams}))
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
})
