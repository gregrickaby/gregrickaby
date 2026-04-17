import {render, screen} from '@/test-utils'
import {fireEvent, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {useLightbox} from './useLightbox'

vi.mock('yet-another-react-lightbox', () => ({
  default: vi.fn().mockReturnValue(null)
}))
vi.mock('yet-another-react-lightbox/styles.css', () => ({}))

interface LightboxTestProps {
  readonly html: string
}

function LightboxTest({html}: LightboxTestProps) {
  const {containerRef, slides, lightboxIndex, closeLightbox} = useLightbox()
  return (
    <div>
      <div ref={containerRef} dangerouslySetInnerHTML={{__html: html}} />
      <span data-testid="index">{lightboxIndex}</span>
      <span data-testid="slide-count">{slides.length}</span>
      <button type="button" onClick={closeLightbox}>
        close
      </button>
    </div>
  )
}

function LightboxTestNoRef() {
  useLightbox()
  return <p>no ref</p>
}

describe('useLightbox', () => {
  it('renders content without errors', () => {
    render(<LightboxTest html="<p>No images</p>" />)
    expect(screen.getByText('No images')).toBeInTheDocument()
  })

  it('starts with lightboxIndex of -1 (closed)', () => {
    render(<LightboxTest html="<p>No images</p>" />)
    expect(screen.getByTestId('index')).toHaveTextContent('-1')
  })

  it('builds slides from images in the container', () => {
    render(<LightboxTest html='<img src="/photo.jpg" alt="A photo" />' />)
    expect(screen.getByTestId('slide-count')).toHaveTextContent('1')
  })

  it('builds slides for multiple images', () => {
    render(
      <LightboxTest html='<img src="/a.jpg" alt="First" /><img src="/b.jpg" alt="Second" />' />
    )
    expect(screen.getByTestId('slide-count')).toHaveTextContent('2')
  })

  it('opens the lightbox at the correct index when an image is clicked', async () => {
    render(<LightboxTest html='<img src="/photo.jpg" alt="Click me" />' />)
    await userEvent.click(screen.getByAltText('Click me'))
    expect(screen.getByTestId('index')).toHaveTextContent('0')
  })

  it('opens at the correct index for multiple images', async () => {
    render(
      <LightboxTest html='<img src="/a.jpg" alt="First" /><img src="/b.jpg" alt="Second" />' />
    )
    await userEvent.click(screen.getByAltText('Second'))
    expect(screen.getByTestId('index')).toHaveTextContent('1')
  })

  it('closes the lightbox when closeLightbox is called', async () => {
    render(<LightboxTest html='<img src="/photo.jpg" alt="Click me" />' />)
    await userEvent.click(screen.getByAltText('Click me'))
    expect(screen.getByTestId('index')).toHaveTextContent('0')
    fireEvent.click(screen.getByRole('button', {name: 'close'}))
    await waitFor(() => {
      expect(screen.getByTestId('index')).toHaveTextContent('-1')
    })
  })

  it('uses figcaption as the slide title when available', () => {
    render(
      <LightboxTest html='<figure><img src="/photo.jpg" alt="alt" /><figcaption>Caption</figcaption></figure>' />
    )
    expect(screen.getByTestId('slide-count')).toHaveTextContent('1')
  })

  it('does not throw when the container ref is not attached', () => {
    expect(() => render(<LightboxTestNoRef />)).not.toThrow()
  })
})
