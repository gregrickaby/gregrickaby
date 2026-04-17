import type {Photo} from 'react-photo-album'
import type {PhotoMeta} from '@/lib/types'
import {render, screen} from '@/test-utils'
import {fireEvent} from '@testing-library/react'

const {mockMasonryPhotoAlbum, mockLightbox} = vi.hoisted(() => ({
  mockMasonryPhotoAlbum: vi.fn(),
  mockLightbox: vi.fn().mockReturnValue(null)
}))

vi.mock('react-photo-album', () => ({MasonryPhotoAlbum: mockMasonryPhotoAlbum}))
vi.mock('react-photo-album/masonry.css', () => ({}))
vi.mock('yet-another-react-lightbox', () => ({default: mockLightbox}))
vi.mock('yet-another-react-lightbox/plugins/captions', () => ({default: {}}))
vi.mock('yet-another-react-lightbox/styles.css', () => ({}))
vi.mock('yet-another-react-lightbox/plugins/captions.css', () => ({}))

const photos: PhotoMeta[] = [
  {
    filename: 'photo-a.jpg',
    title: 'Photo A',
    width: 1920,
    height: 1080,
    dateTaken: '2024-06-15T10:00:00Z'
  },
  {
    filename: 'photo-b.jpg',
    title: 'Photo B',
    width: 1080,
    height: 1920,
    dateTaken: '2024-05-01T10:00:00Z'
  }
]

describe('PhotoGallery', () => {
  beforeEach(() => {
    mockLightbox.mockClear()
    mockMasonryPhotoAlbum.mockImplementation(
      ({
        photos: albumPhotos,
        onClick
      }: {
        photos: Photo[]
        onClick?: (props: {
          photo: Photo
          index: number
          event: MouseEvent
        }) => void
      }) =>
        albumPhotos.map((photo: Photo, index: number) => (
          <button
            key={photo.src}
            type="button"
            onClick={() =>
              onClick?.({photo, index, event: {} as unknown as MouseEvent})
            }
          >
            <img alt={photo.alt} src={photo.src} />
          </button>
        ))
    )
  })

  it('renders all photos', async () => {
    const {PhotoGallery} = await import('./PhotoGallery')
    render(<PhotoGallery photos={photos} />)
    expect(screen.getByAltText('Photo A')).toBeInTheDocument()
    expect(screen.getByAltText('Photo B')).toBeInTheDocument()
  })

  it('renders the correct number of photo buttons', async () => {
    const {PhotoGallery} = await import('./PhotoGallery')
    render(<PhotoGallery photos={photos} />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('renders an empty gallery without crashing', async () => {
    mockMasonryPhotoAlbum.mockReturnValueOnce(null)
    const {PhotoGallery} = await import('./PhotoGallery')
    render(<PhotoGallery photos={[]} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the Lightbox component', async () => {
    const {PhotoGallery} = await import('./PhotoGallery')
    render(<PhotoGallery photos={photos} />)
    expect(mockLightbox).toHaveBeenCalled()
  })

  it('passes correct photos to MasonryPhotoAlbum', async () => {
    const {PhotoGallery} = await import('./PhotoGallery')
    render(<PhotoGallery photos={photos} />)
    const props = mockMasonryPhotoAlbum.mock.calls.at(-1)?.[0]
    expect(props?.photos).toHaveLength(2)
    expect(props?.photos[0]).toMatchObject({
      src: '/content/photos/photo-a.jpg',
      alt: 'Photo A',
      width: 1920,
      height: 1080
    })
  })

  it('opens the lightbox when a photo button is clicked', async () => {
    const {PhotoGallery} = await import('./PhotoGallery')
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    const lightboxProps = mockLightbox.mock.calls.at(-1)?.[0]
    expect(lightboxProps?.open).toBe(true)
    expect(lightboxProps?.index).toBe(0)
  })

  it('opens the lightbox at the correct index for the second photo', async () => {
    const {PhotoGallery} = await import('./PhotoGallery')
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getAllByRole('button')[1])
    const lightboxProps = mockLightbox.mock.calls.at(-1)?.[0]
    expect(lightboxProps?.open).toBe(true)
    expect(lightboxProps?.index).toBe(1)
  })
})
