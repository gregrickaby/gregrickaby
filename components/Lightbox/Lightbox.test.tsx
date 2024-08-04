import {Lightbox, LightboxProps} from '@/components/Lightbox'
import {mockEmptyThreads, mockThreads} from '@/lib/mocks/mockThreads'
import '@testing-library/jest-dom'
import {act, fireEvent, render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'

const defaultProps: LightboxProps = {
  photos: mockThreads,
  onClose: vi.fn(),
  startIndex: 0
}

describe('Lightbox', () => {
  it('should render', () => {
    const {getByTestId} = render(<Lightbox {...defaultProps} />)

    expect(getByTestId('lightbox')).toBeInTheDocument()
    expect(getByTestId('image')).toHaveAttribute(
      'src',
      mockThreads.data[0].media_url
    )
  })

  it('should not render if there are no photos', () => {
    const {queryByTestId} = render(
      <Lightbox {...defaultProps} photos={mockEmptyThreads} />
    )

    expect(queryByTestId('lightbox')).not.toBeInTheDocument()
  })

  it('should navigate to the next photo on next arrow click', async () => {
    const {getByTestId} = render(<Lightbox {...defaultProps} />)
    const nextButton = getByTestId('next-button')

    await userEvent.click(nextButton)

    waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute(
        'src',
        mockThreads.data[1].media_url
      )
    })
  })

  it('should navigate to the previous photo on previous arrow click', async () => {
    const {getByTestId} = render(<Lightbox {...defaultProps} />)
    const previousButton = getByTestId('previous-button')

    await userEvent.click(previousButton)

    waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute(
        'src',
        mockThreads.data[2].media_url
      )
    })
  })

  it('should navigate to the next photo with the right arrow key', async () => {
    const {getByTestId} = render(<Lightbox {...defaultProps} />)

    await userEvent.type(getByTestId('image'), '{arrowRight}')

    waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute(
        'src',
        mockThreads.data[1].media_url
      )
    })
  })

  it('should navigate to the previous photo with the left arrow key', async () => {
    const {getByTestId} = render(<Lightbox {...defaultProps} />)

    await userEvent.type(getByTestId('image'), '{arrowLeft}')

    waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute(
        'src',
        mockThreads.data[2].media_url
      )
    })
  })

  it('should navigate to the next photo with the swipe gesture', async () => {
    const {getByTestId} = render(<Lightbox {...defaultProps} />)

    fireEvent.touchStart(getByTestId('image'), {touches: [{clientX: 300}]})
    fireEvent.touchEnd(getByTestId('image'), {changedTouches: [{clientX: 0}]})

    waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute(
        'src',
        mockThreads.data[1].media_url
      )
    })
  })

  it('should navigate to the previous photo with the swipe gesture', async () => {
    const {getByTestId} = render(<Lightbox {...defaultProps} />)

    fireEvent.touchStart(getByTestId('image'), {touches: [{clientX: 0}]})
    fireEvent.touchEnd(getByTestId('image'), {
      changedTouches: [{clientX: 300}]
    })

    waitFor(() => {
      expect(getByTestId('image')).toHaveAttribute(
        'src',
        mockThreads.data[4].media_url
      )
    })
  })

  it('should close the lightbox with the escape key', async () => {
    render(<Lightbox {...defaultProps} />)
    const onClose = defaultProps.onClose

    await act(async () => {
      fireEvent.keyDown(window, {key: 'Escape'})
    })

    waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })
})
