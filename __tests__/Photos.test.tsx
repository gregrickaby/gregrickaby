import {LightboxProps} from '@/components/Lightbox'
import Photos from '@/components/Photos'
import '@testing-library/jest-dom'
import {fireEvent, render, screen} from '@testing-library/react'
import {axe} from 'jest-axe'
import {describe, expect, it, vi} from 'vitest'

const photos = [
  '/path/to/photo1.jpg',
  '/path/to/photo2.jpg',
  '/path/to/photo3.jpg'
]

vi.mock('@/components/Lightbox', () => ({
  __esModule: true,
  default: ({images, onClose, startIndex}: LightboxProps) => (
    <div data-testid="lightbox">
      <button onClick={onClose} data-testid="close-lightbox">
        Close
      </button>
      <img src={images[startIndex]} alt={`${startIndex + 1}`} />
    </div>
  )
}))

describe('Photos', () => {
  it('should render all photos', () => {
    render(<Photos photos={photos} />)
    photos.forEach((photo, index) => {
      const img = screen.getByAltText(`${index + 1}`)
      expect(img).toBeInTheDocument()
    })
  })

  it('should open the lightbox when a photo is clicked', () => {
    render(<Photos photos={photos} />)
    const photoDiv = screen.getByRole('button', {name: 'Open photo 1'})
    fireEvent.click(photoDiv)
    const lightbox = screen.getByTestId('lightbox')
    expect(lightbox).toBeInTheDocument()
  })

  it('should open the lightbox when Enter key is pressed on a photo', () => {
    render(<Photos photos={photos} />)
    const photoDiv = screen.getByRole('button', {name: 'Open photo 1'})
    fireEvent.keyPress(photoDiv, {key: 'Enter', code: 'Enter', charCode: 13})
    const lightbox = screen.getByTestId('lightbox')
    expect(lightbox).toBeInTheDocument()
  })

  it('should close the lightbox when the close button is clicked', () => {
    render(<Photos photos={photos} />)
    const photoDiv = screen.getByRole('button', {name: 'Open photo 1'})
    fireEvent.click(photoDiv)
    const closeButton = screen.getByTestId('close-lightbox')
    fireEvent.click(closeButton)
    expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument()
  })

  it('should not have any accessibility issues', async () => {
    const {container} = render(<Photos photos={photos} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    const {container} = render(<Photos photos={photos} />)
    expect(container).toMatchSnapshot()
  })
})
