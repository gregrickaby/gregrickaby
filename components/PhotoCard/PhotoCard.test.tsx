import type {PhotoMeta} from '@/lib/types'
import {render, screen} from '@/test-utils'
import {PhotoCard} from './PhotoCard'

const photo: PhotoMeta = {
  filename: 'sunset-at-the-pier.jpg',
  title: 'Sunset at the Pier',
  caption: 'A beautiful sunset.',
  width: 4000,
  height: 3000,
  camera: 'Canon EOS R5',
  lens: 'RF 70-200mm F2.8L IS USM',
  aperture: 'f/2.8',
  shutterSpeed: '1/250s',
  iso: '400',
  focalLength: '200mm',
  dateTaken: '2024-06-15T10:30:00.000Z',
  gps: {latitude: 30.6954, longitude: -87.9022}
}

describe('PhotoCard', () => {
  it('renders the photo image with alt text', () => {
    render(<PhotoCard photo={photo} />)
    expect(screen.getByAltText('Sunset at the Pier')).toBeInTheDocument()
  })

  it('renders the title', () => {
    render(<PhotoCard photo={photo} />)
    expect(screen.getByText('Sunset at the Pier')).toBeInTheDocument()
  })

  it('renders camera and lens info', () => {
    render(<PhotoCard photo={photo} />)
    expect(
      screen.getByText('Canon EOS R5 · RF 70-200mm F2.8L IS USM')
    ).toBeInTheDocument()
  })

  it('renders EXIF settings', () => {
    render(<PhotoCard photo={photo} />)
    expect(
      screen.getByText('f/2.8 · 1/250s · ISO 400 · 200mm')
    ).toBeInTheDocument()
  })

  it('renders the date taken', () => {
    render(<PhotoCard photo={photo} />)
    expect(screen.getByText('Jun 15, 2024')).toBeInTheDocument()
  })

  it('wraps the image in a Fancybox-compatible link', () => {
    render(<PhotoCard photo={photo} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'href',
      '/content/photos/sunset-at-the-pier.jpg'
    )
    expect(link).toHaveAttribute('data-fancybox', 'photos')
    expect(link).toHaveAttribute('data-caption')
  })

  it('handles missing optional fields gracefully', () => {
    const minimal: PhotoMeta = {
      filename: 'minimal.jpg',
      title: 'Minimal Photo',
      width: 800,
      height: 600
    }
    render(<PhotoCard photo={minimal} />)
    expect(screen.getByText('Minimal Photo')).toBeInTheDocument()
    expect(screen.getByAltText('Minimal Photo')).toBeInTheDocument()
  })
})
