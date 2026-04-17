import {render, screen} from '@/test-utils'
import {Article} from './Article'

const meta = {
  title: 'Test Post',
  slug: 'test-post',
  date: '2024-01-15T00:00:00Z',
  modified: '2024-01-15T00:00:00Z',
  type: 'post' as const,
  description: 'A test post',
  categories: ['Tech', 'React'],
  tags: ['typescript', 'testing'],
  featuredImage: './featured.jpg'
}

const content = '<p>Hello world</p>'

describe('Article', () => {
  it('renders the title', () => {
    render(<Article meta={meta} content={content} />)
    expect(
      screen.getByRole('heading', {level: 1, name: 'Test Post'})
    ).toBeInTheDocument()
  })

  it('renders the formatted date', () => {
    render(<Article meta={meta} content={content} />)
    // Date renders in local timezone, so just check month/year
    expect(screen.getByText(/January.*2024/)).toBeInTheDocument()
  })

  it('renders categories as links to the archive', () => {
    render(<Article meta={meta} content={content} />)
    const techLink = screen.getByRole('link', {name: 'Tech'})
    expect(techLink).toHaveAttribute('href', '/category/Tech')
    const reactLink = screen.getByRole('link', {name: 'React'})
    expect(reactLink).toHaveAttribute('href', '/category/React')
  })

  it('renders tags as links in the footer', () => {
    render(<Article meta={meta} content={content} />)
    const tsLink = screen.getByRole('link', {name: 'typescript'})
    expect(tsLink).toHaveAttribute('href', '/tag/typescript')
    const testingLink = screen.getByRole('link', {name: 'testing'})
    expect(testingLink).toHaveAttribute('href', '/tag/testing')
  })

  it('does not render a tags footer when tags are absent', () => {
    const noTagsMeta = {...meta, tags: undefined}
    render(<Article meta={noTagsMeta} content={content} />)
    expect(
      screen.queryByRole('link', {name: 'typescript'})
    ).not.toBeInTheDocument()
  })

  it('renders the HTML content', () => {
    render(<Article meta={meta} content={content} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders the featured image', () => {
    render(<Article meta={meta} content={content} />)
    expect(screen.getByAltText('Test Post')).toBeInTheDocument()
  })

  it('does not render an image when featuredImage is absent', () => {
    const noImageMeta = {...meta, featuredImage: undefined}
    render(<Article meta={noImageMeta} content={content} />)
    expect(screen.queryByAltText('Test Post')).not.toBeInTheDocument()
  })

  it('does not render the featured image when it matches the first content image', () => {
    const contentWithSameImage =
      '<img src="/content/posts/test-post/featured.jpg" alt="featured" /><p>Hello world</p>'
    render(<Article meta={meta} content={contentWithSameImage} />)
    expect(screen.queryByAltText('Test Post')).not.toBeInTheDocument()
  })

  it('does not render the date or categories for pages', () => {
    const pageMeta = {...meta, type: 'page' as const}
    render(<Article meta={pageMeta} content={content} />)
    expect(screen.queryByText(/January.*2024/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Tech, React/)).not.toBeInTheDocument()
  })
})
