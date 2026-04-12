import type {PhotoMeta} from '@/lib/types'
import {render, screen} from '@/test-utils'
import {PhotoGallery} from './PhotoGallery'

vi.mock('@fancyapps/ui/dist/fancybox/', () => ({
  Fancybox: {
    bind: vi.fn(),
    unbind: vi.fn()
  }
}))

vi.mock('@fancyapps/ui/dist/fancybox/fancybox.css', () => ({}))

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
  it('renders all photos', () => {
    render(<PhotoGallery photos={photos} />)
    expect(screen.getByAltText('Photo A')).toBeInTheDocument()
    expect(screen.getByAltText('Photo B')).toBeInTheDocument()
  })

  it('renders the correct number of Fancybox links', () => {
    render(<PhotoGallery photos={photos} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
  })

  it('renders an empty gallery without crashing', () => {
    render(<PhotoGallery photos={[]} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
