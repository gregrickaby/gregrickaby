import {render, screen} from '@/test-utils'
import {useFancybox} from './useFancybox'

vi.mock('@fancyapps/ui/dist/fancybox/', () => ({
  Fancybox: {bind: vi.fn(), unbind: vi.fn()}
}))
vi.mock('@fancyapps/ui/dist/fancybox/fancybox.css', () => ({}))

interface FancyboxTestProps {
  readonly html: string
}

function FancyboxTest({html}: FancyboxTestProps) {
  const {containerRef} = useFancybox()
  return <div ref={containerRef} dangerouslySetInnerHTML={{__html: html}} />
}

function FancyboxTestNoRef() {
  // intentionally does not attach the ref to any element
  useFancybox()
  return <p>no ref</p>
}

describe('useFancybox', () => {
  it('renders content without errors', () => {
    render(<FancyboxTest html="<p>No images</p>" />)
    expect(screen.getByText('No images')).toBeInTheDocument()
  })

  it('wraps images with fancybox anchor links', () => {
    render(<FancyboxTest html='<img src="/photo.jpg" alt="A photo" />' />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('data-fancybox')
    expect(link).toHaveAttribute('href', '/photo.jpg')
  })

  it('sets data-caption from alt text', () => {
    render(<FancyboxTest html='<img src="/photo.jpg" alt="My caption" />' />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('data-caption', 'My caption')
  })

  it('prefers figcaption over alt text for the caption', () => {
    const html =
      '<figure><img src="/photo.jpg" alt="alt text" /><figcaption>Figure caption</figcaption></figure>'
    render(<FancyboxTest html={html} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('data-caption', 'Figure caption')
  })

  it('groups sibling images under the same data-fancybox value', () => {
    const html =
      '<div><img src="/a.jpg" alt="first" /><img src="/b.jpg" alt="second" /></div>'
    render(<FancyboxTest html={html} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('data-fancybox', 'gallery')
    expect(links[1]).toHaveAttribute('data-fancybox', 'gallery')
  })

  it('gives solo images a unique data-fancybox value', () => {
    render(<FancyboxTest html='<img src="/solo.jpg" alt="Solo" />' />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'data-fancybox',
      expect.stringContaining('single-')
    )
  })

  it('does not wrap images already inside an anchor tag', () => {
    const html = '<a href="/page"><img src="/photo.jpg" alt="Linked" /></a>'
    render(<FancyboxTest html={html} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/page')
    expect(links[0]).not.toHaveAttribute('data-fancybox')
  })

  it('calls Fancybox.unbind on unmount', async () => {
    const {Fancybox} = await import('@fancyapps/ui/dist/fancybox/')
    const {unmount} = render(
      <FancyboxTest html='<img src="/photo.jpg" alt="test" />' />
    )
    unmount()
    expect(vi.mocked(Fancybox.unbind)).toHaveBeenCalled()
  })

  it('does not set data-caption when alt text is empty', () => {
    render(<FancyboxTest html='<img src="/photo.jpg" alt="" />' />)
    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('data-caption')
  })

  it('does not bind Fancybox when the container ref is not attached', () => {
    // Renders without attaching ref — should not throw
    expect(() => render(<FancyboxTestNoRef />)).not.toThrow()
  })
})
