import {getAllPosts, getPostBySlug} from '@/lib/content'
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
  notFound: vi.fn()
}))

vi.mock('@/lib/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/content')>()
  return {
    ...actual,
    getPostBySlug: vi.fn().mockResolvedValue({
      meta: {
        title: 'Hello World',
        slug: 'hello-world',
        date: '2024-03-15T00:00:00Z',
        modified: '2024-03-20T00:00:00Z',
        type: 'post',
        description: 'A greeting to the world.',
        categories: ['General']
      },
      content: '<p>Welcome to my blog.</p>'
    }),
    getAllPosts: vi.fn().mockResolvedValue([
      {
        title: 'Hello World',
        slug: 'hello-world',
        date: '2024-03-15T00:00:00Z',
        modified: '2024-03-20T00:00:00Z',
        type: 'post'
      }
    ])
  }
})

describe('[slug] page', () => {
  it('renders the post title', async () => {
    const {default: PostPage} = await import('./page')
    const result = await PostPage({
      params: Promise.resolve({slug: 'hello-world'})
    })
    render(result)
    expect(
      screen.getByRole('heading', {level: 1, name: 'Hello World'})
    ).toBeInTheDocument()
  })

  it('renders the post content', async () => {
    const {default: PostPage} = await import('./page')
    const result = await PostPage({
      params: Promise.resolve({slug: 'hello-world'})
    })
    render(result)
    expect(screen.getByText('Welcome to my blog.')).toBeInTheDocument()
  })

  it('generates static params', async () => {
    const {generateStaticParams} = await import('./page')
    const params = await generateStaticParams()
    expect(params).toEqual([{slug: 'hello-world'}])
  })

  it('renders prev/next navigation when the post has neighbors', async () => {
    vi.mocked(getAllPosts).mockResolvedValueOnce([
      {
        title: 'Newer Post',
        slug: 'newer-post',
        date: '2024-04-01T00:00:00Z',
        modified: '2024-04-01T00:00:00Z',
        type: 'post'
      },
      {
        title: 'Hello World',
        slug: 'hello-world',
        date: '2024-03-15T00:00:00Z',
        modified: '2024-03-20T00:00:00Z',
        type: 'post'
      },
      {
        title: 'Older Post',
        slug: 'older-post',
        date: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        type: 'post'
      }
    ])
    const {default: PostPage} = await import('./page')
    const result = await PostPage({
      params: Promise.resolve({slug: 'hello-world'})
    })
    render(result)
    expect(screen.getByText('Older Post')).toBeInTheDocument()
    expect(screen.getByText('Newer Post')).toBeInTheDocument()
  })

  it('returns empty metadata when the post does not exist', async () => {
    vi.mocked(getPostBySlug).mockResolvedValueOnce(null)
    const {generateMetadata} = await import('./page')
    const metadata = await generateMetadata(
      {params: Promise.resolve({slug: 'missing'})},
      Promise.resolve({openGraph: null}) as never
    )
    expect(metadata).toEqual({})
  })
})
