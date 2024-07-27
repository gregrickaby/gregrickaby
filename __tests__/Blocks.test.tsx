import {mockPost} from '@/__tests__/__mocks__'
import Blocks from '@/components/Blocks'
import '@testing-library/jest-dom'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'

describe('Blocks component', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should render', () => {
    const {getByTestId} = render(<Blocks content={mockPost.content.rendered} />)
    const blocks = getByTestId('blocks')
    expect(blocks).toBeInTheDocument()
  })

  it('should open a modal when an image is clicked', async () => {
    const {container} = render(<Blocks content={mockPost.content.rendered} />)
    // Get the gallery
    const gallery = container.querySelector('#grd-photo-gallery-gallery')

    // Verify the gallery is in the document.
    expect(gallery).toBeInTheDocument()

    // Get the first image.
    const image = gallery.querySelector('img')

    // Click the first image.
    fireEvent.click(image)

    // Wait for FancyBox to open.
    await waitFor(() => {
      // Get Fancybox modal.
      const fancybox = container.querySelector('.fancybox__container')

      // Expect the modal to be in the document.
      expect(fancybox).toBeInTheDocument()
    })
  })
})
