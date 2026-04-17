import {render, screen} from '@/test-utils'

const {mockLightbox} = vi.hoisted(() => ({
  mockLightbox: vi.fn().mockReturnValue(null)
}))

vi.mock('yet-another-react-lightbox', () => ({default: mockLightbox}))
vi.mock('yet-another-react-lightbox/plugins/captions', () => ({default: {}}))
vi.mock('yet-another-react-lightbox/styles.css', () => ({}))
vi.mock('yet-another-react-lightbox/plugins/captions.css', () => ({}))

describe('ArticleContent', () => {
  it('renders HTML content', async () => {
    const {ArticleContent} = await import('./ArticleContent')
    render(<ArticleContent content="<p>Hello world</p>" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders images from HTML content', async () => {
    const {ArticleContent} = await import('./ArticleContent')
    render(<ArticleContent content='<img src="/photo.jpg" alt="A photo" />' />)
    expect(screen.getByAltText('A photo')).toBeInTheDocument()
  })

  it('renders multiple images from HTML content', async () => {
    const {ArticleContent} = await import('./ArticleContent')
    render(
      <ArticleContent content='<img src="/a.jpg" alt="First" /><img src="/b.jpg" alt="Second" />' />
    )
    expect(screen.getByAltText('First')).toBeInTheDocument()
    expect(screen.getByAltText('Second')).toBeInTheDocument()
  })

  it('renders the Lightbox component', async () => {
    const {ArticleContent} = await import('./ArticleContent')
    render(<ArticleContent content="<p>Content</p>" />)
    expect(mockLightbox).toHaveBeenCalled()
  })

  it('renders with figcaption markup without errors', async () => {
    const {ArticleContent} = await import('./ArticleContent')
    const html =
      '<figure><img src="/photo.jpg" alt="alt" /><figcaption>Caption</figcaption></figure>'
    render(<ArticleContent content={html} />)
    expect(screen.getByAltText('alt')).toBeInTheDocument()
    expect(screen.getByText('Caption')).toBeInTheDocument()
  })
})
