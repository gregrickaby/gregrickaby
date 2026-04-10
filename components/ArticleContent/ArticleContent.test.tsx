import {render, screen} from '@/test-utils'
import {ArticleContent} from './ArticleContent'

vi.mock('@fancyapps/ui/dist/fancybox/', () => ({
  Fancybox: {bind: vi.fn(), unbind: vi.fn()}
}))
vi.mock('@fancyapps/ui/dist/fancybox/fancybox.css', () => ({}))

describe('ArticleContent', () => {
  it('renders HTML content', () => {
    render(<ArticleContent content="<p>Hello world</p>" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('wraps images with fancybox links', () => {
    render(<ArticleContent content='<img src="/photo.jpg" alt="A photo" />' />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('data-fancybox')
    expect(link).toHaveAttribute('href', '/photo.jpg')
  })

  it('sets data-caption from alt text', () => {
    render(
      <ArticleContent content='<img src="/photo.jpg" alt="My caption" />' />
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('data-caption', 'My caption')
  })

  it('sets data-caption from figcaption when available', () => {
    const html =
      '<figure><img src="/photo.jpg" alt="alt" /><figcaption>Figure caption</figcaption></figure>'
    render(<ArticleContent content={html} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('data-caption', 'Figure caption')
  })

  it('groups sibling images under the same data-fancybox value', () => {
    const html =
      '<div><img src="/a.jpg" alt="first" /><img src="/b.jpg" alt="second" /></div>'
    render(<ArticleContent content={html} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('data-fancybox', 'gallery')
    expect(links[1]).toHaveAttribute('data-fancybox', 'gallery')
  })

  it('gives solo images a unique data-fancybox value', () => {
    render(<ArticleContent content='<img src="/solo.jpg" alt="Solo" />' />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'data-fancybox',
      expect.stringContaining('single-')
    )
  })
})
