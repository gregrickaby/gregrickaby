import {Gallery} from '@/components/Gallery'
import {mockEmptyThreads, mockThreads} from '@/mocks/mockThreads'
import '@testing-library/jest-dom'
import {render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {axe} from 'jest-axe'
import {describe, expect, it} from 'vitest'

describe('Gallery', () => {
  it('should render', () => {
    const {getByTestId} = render(<Gallery photos={mockThreads} />)
    const gallery = getByTestId('gallery')
    expect(gallery).toBeInTheDocument()
  })

  it('should not render if there are no photos', () => {
    const {queryByTestId} = render(<Gallery photos={mockEmptyThreads} />)
    const gallery = queryByTestId('gallery')
    expect(gallery).not.toBeInTheDocument()
  })

  it('should open the lightbox when a photo is clicked', async () => {
    const {getByTestId} = render(<Gallery photos={mockThreads} />)
    const photo = getByTestId('photo-0')

    await userEvent.click(photo)

    waitFor(() => {
      const lightbox = getByTestId('lightbox')
      expect(lightbox).toBeInTheDocument()
    })
  })

  it('should open the lightbox by pressing Enter on a photo', async () => {
    const {getByTestId} = render(<Gallery photos={mockThreads} />)
    const photo = getByTestId('photo-0')

    await userEvent.type(photo, '{enter}')

    waitFor(() => {
      const lightbox = getByTestId('lightbox')
      expect(lightbox).toBeInTheDocument()
    })
  })

  it('should close the lightbox when the close button is clicked', async () => {
    const {getByTestId} = render(<Gallery photos={mockThreads} />)
    const photo = getByTestId('photo-0')

    await userEvent.click(photo)

    waitFor(() => {
      const lightbox = getByTestId('lightbox')
      expect(lightbox).toBeInTheDocument()
    })

    const closeButton = getByTestId('close-button')
    await userEvent.click(closeButton)

    waitFor(() => {
      const lightbox = getByTestId('lightbox')
      expect(lightbox).not.toBeInTheDocument()
    })
  })

  it('should not have any accessibility issues', async () => {
    const {container} = render(<Gallery photos={mockThreads} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    const {getByTestId} = render(<Gallery photos={mockThreads} />)
    const gallery = getByTestId('gallery')
    expect(gallery).toMatchSnapshot()
  })
})
