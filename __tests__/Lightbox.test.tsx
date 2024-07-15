import Lightbox from '@/components/Lightbox'
import '@testing-library/jest-dom'
import {act, fireEvent, render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {axe} from 'jest-axe'
import {useState} from 'react'
import {describe, expect, it} from 'vitest'

interface MockComponentProps {
  images: string[]
}

// Mock images.
const images = [
  'https://via.placeholder.com/600/92c952',
  'https://via.placeholder.com/600/771796',
  'https://via.placeholder.com/600/24f355'
]

// Mock component.
const MockComponent = ({images}: MockComponentProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>Open</button>
      {isOpen && (
        <Lightbox
          images={images}
          onClose={() => setIsOpen(false)}
          startIndex={0}
        />
      )}
    </>
  )
}

describe('Lightbox', () => {
  afterEach(() => {
    document.body.style.overflow = 'auto'
  })

  it('should toggle the lightbox using state', async () => {
    const {getByRole, queryByTestId} = render(<MockComponent images={images} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Verify the lightbox is rendered.
    await waitFor(() => {
      expect(queryByTestId('lightbox')).toBeInTheDocument()
    })

    // Close the lightbox.
    const closeButton = getByRole('button', {name: /open/i})
    await userEvent.click(closeButton)

    // Verify the lightbox is closed.
    await waitFor(() => {
      expect(queryByTestId('lightbox')).not.toBeInTheDocument()
    })
  })

  it('should close the lightbox when the close button is clicked', async () => {
    const {getByRole, queryByTestId, getByTestId} = render(
      <MockComponent images={images} />
    )

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Close the lightbox.
    const closeButton = getByTestId('close-button')
    await userEvent.click(closeButton)

    // Verify the lightbox is closed.
    await waitFor(() => {
      expect(queryByTestId('lightbox')).not.toBeInTheDocument()
    })
  })

  it('should navigate to the next image', async () => {
    const {getByRole, getByTestId} = render(<MockComponent images={images} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Navigate to the next image.
    const nextButton = getByTestId('next-button')
    await userEvent.click(nextButton)

    // Verify the next image is displayed.
    await waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute('src', images[1])
    })
  })

  it('should navigate to the next image using the next arrow key', async () => {
    const {getByRole, getByTestId} = render(<MockComponent images={images} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Navigate to the next image.
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}))
    })

    // Verify the next image is displayed.
    await waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute('src', images[1])
    })
  })

  it('should navigate to the next image using a swipe gesture', async () => {
    const {getByRole, getByTestId} = render(<MockComponent images={images} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Swipe to the next image.
    const dialog = getByTestId('lightbox')
    fireEvent.touchStart(dialog, {touches: [{clientX: 300}]})
    fireEvent.touchEnd(dialog, {changedTouches: [{clientX: 0}]})

    // Verify the next image is displayed.
    await waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute('src', images[1])
    })
  })

  it('should navigate to the previous image', async () => {
    const {getByRole, getByTestId} = render(<MockComponent images={images} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Navigate to the previous image.
    const prevButton = getByTestId('prev-button')
    await userEvent.click(prevButton)

    // Verify the previous image is displayed.
    await waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute('src', images[2])
    })
  })

  it('should navigate to the previous image using a swipe gesture', async () => {
    const {getByRole, getByTestId} = render(<MockComponent images={images} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Navigate to the previous image.
    const dialog = getByTestId('lightbox')
    fireEvent.touchStart(dialog, {touches: [{clientX: 0}]})
    fireEvent.touchEnd(dialog, {changedTouches: [{clientX: 300}]})

    // Verify the previous image is displayed.
    await waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute('src', images[2])
    })
  })

  it('should navigate to the previous image using the previous arrow key', async () => {
    const {getByRole, getByTestId} = render(<MockComponent images={images} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Navigate to the previous image.
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}))
    })

    // Verify the previous image is displayed.
    await waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute('src', images[2])
    })
  })

  it('should close the lightbox when the escape key is pressed', async () => {
    const {getByRole, queryByTestId} = render(<MockComponent images={images} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Close the lightbox.
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))
    })

    // Verify the lightbox is closed.
    await waitFor(() => {
      expect(queryByTestId('lightbox')).not.toBeInTheDocument()
    })
  })

  it('should not render the lightbox if there are no images', async () => {
    const {getByRole, queryByTestId} = render(<MockComponent images={[]} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Verify the lightbox is not in the document.
    await waitFor(() => {
      expect(queryByTestId('lightbox')).not.toBeInTheDocument()
    })
  })

  it('should have no accessibility violations', async () => {
    const {container, getByRole} = render(<MockComponent images={images} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    act(() => {
      userEvent.click(button)
    })

    // Verify the lightbox has no accessibility violations.
    await waitFor(async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  it('should match the snapshot', async () => {
    const {container, getByRole} = render(<MockComponent images={images} />)

    // Open the lightbox.
    const button = getByRole('button', {name: /open/i})
    await userEvent.click(button)

    // Verify the rendered component matches the snapshot.
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })
})
