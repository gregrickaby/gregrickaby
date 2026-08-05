import {render, screen} from '@/test-utils'

const {mockLightbox} = vi.hoisted(() => ({
  mockLightbox: vi.fn()
}))

vi.mock('yet-another-react-lightbox', () => ({default: mockLightbox}))
vi.mock('yet-another-react-lightbox/plugins/captions', () => ({
  default: 'captions-plugin'
}))
vi.mock('yet-another-react-lightbox/styles.css', () => ({}))
vi.mock('yet-another-react-lightbox/plugins/captions.css', () => ({}))

describe('Lightbox', () => {
  beforeEach(() => {
    mockLightbox.mockClear()
    mockLightbox.mockReturnValue(<div data-testid="lightbox" />)
  })

  it('always includes the Captions plugin', async () => {
    const {Lightbox} = await import('./Lightbox')
    render(<Lightbox slides={[]} index={-1} open={false} close={vi.fn()} />)
    await screen.findByTestId('lightbox')
    const props = mockLightbox.mock.calls.at(-1)?.[0]
    expect(props?.plugins).toContain('captions-plugin')
  })

  it('appends additional plugins after Captions', async () => {
    const {Lightbox} = await import('./Lightbox')
    const extraPlugin = vi.fn()
    render(
      <Lightbox
        slides={[]}
        index={-1}
        open={false}
        close={vi.fn()}
        plugins={[extraPlugin]}
      />
    )
    await screen.findByTestId('lightbox')
    const props = mockLightbox.mock.calls.at(-1)?.[0]
    expect(props?.plugins).toEqual(['captions-plugin', extraPlugin])
  })

  it('passes slides, index, open, close, className, and captions through', async () => {
    const {Lightbox} = await import('./Lightbox')
    const close = vi.fn()
    const slides = [{src: '/a.jpg'}]
    render(
      <Lightbox
        slides={slides}
        index={2}
        open
        close={close}
        className="custom"
        captions={{showToggle: true}}
      />
    )
    await screen.findByTestId('lightbox')
    const props = mockLightbox.mock.calls.at(-1)?.[0]
    expect(props?.slides).toBe(slides)
    expect(props?.index).toBe(2)
    expect(props?.open).toBe(true)
    expect(props?.close).toBe(close)
    expect(props?.className).toBe('custom')
    expect(props?.captions).toEqual({showToggle: true})
  })
})
