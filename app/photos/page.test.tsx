import {render, screen} from '@/test-utils'

vi.mock('@fancyapps/ui/dist/fancybox/', () => ({
  Fancybox: {
    bind: vi.fn(),
    unbind: vi.fn()
  }
}))

vi.mock('@fancyapps/ui/dist/fancybox/fancybox.css', () => ({}))

vi.mock('@/lib/photos', () => ({
  getPhotos: vi.fn().mockResolvedValue([
    {
      filename: 'sunset.jpg',
      title: 'Sunset',
      width: 1920,
      height: 1080,
      camera: 'Canon EOS R5',
      aperture: 'f/2.8',
      dateTaken: '2024-06-15T10:00:00Z'
    },
    {
      filename: 'bird.jpg',
      title: 'Bird',
      width: 1080,
      height: 1920,
      dateTaken: '2024-05-01T10:00:00Z'
    }
  ])
}))

describe('Photos page', () => {
  it('renders the page title', async () => {
    const {default: PhotosPage} = await import('./page')
    const result = await PhotosPage()
    render(result)
    expect(
      screen.getByRole('heading', {level: 1, name: 'Photos'})
    ).toBeInTheDocument()
  })

  it('renders photos from getPhotos', async () => {
    const {default: PhotosPage} = await import('./page')
    const result = await PhotosPage()
    render(result)
    expect(screen.getByAltText('Sunset')).toBeInTheDocument()
    expect(screen.getByAltText('Bird')).toBeInTheDocument()
  })

  it('generates metadata', async () => {
    const {generateMetadata} = await import('./page')
    const metadata = generateMetadata()
    expect(metadata.title).toBe('Photos')
    expect(metadata.description).toBe(
      'A collection of photographs by Greg Rickaby.'
    )
  })

  it('renders empty state when no photos', async () => {
    const {getPhotos} = await import('@/lib/photos')
    vi.mocked(getPhotos).mockResolvedValueOnce([])
    // Re-import to pick up the new mock
    vi.resetModules()
    vi.doMock('@/lib/photos', () => ({
      getPhotos: vi.fn().mockResolvedValue([])
    }))
    const {default: PhotosPage} = await import('./page')
    const result = await PhotosPage()
    render(result)
    expect(screen.getByText('No photos yet.')).toBeInTheDocument()
  })
})
