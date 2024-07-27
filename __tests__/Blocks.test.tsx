import Blocks, {galleryInit} from '@/components/Blocks'
import '@testing-library/jest-dom'
import {render} from '@testing-library/react'
import {axe} from 'jest-axe'
import {describe, expect, it, vi} from 'vitest'
import {mockPost} from './__mocks__'

describe('galleryInit() tests', () => {
  it('should bail on the server', async () => {
    // Save the original window object.
    const originalWindow = global.window

    // Delete the window object.
    // @ts-ignore: Barking about globals in a test.
    delete global.window

    // Create a mock contentRef.
    const contentRef = {current: null}

    // Spy on galleryInit function.
    const spy = vi.fn(() => galleryInit(contentRef))
    await spy()

    // Verify that the function returned.
    expect(spy).toHaveReturned()

    // Restore window object.
    global.window = originalWindow
  })

  it('should bail if no ref is provided', async () => {
    // Create a mock contentRef with current set to null.
    const contentRef = {current: null}

    // Spy on galleryInit function
    const spy = vi.fn(() => galleryInit(contentRef))
    await spy()

    // Verify that the function returned.
    expect(spy).toHaveReturned()
  })

  it('should bail if no gallery element is found', async () => {
    // Create a mock contentRef with an element that does not contain the gallery.
    const contentRef = {
      current: document.createElement('div')
    }

    // Spy on galleryInit function.
    const spy = vi.fn(() => galleryInit(contentRef))
    await spy()

    // Verify that the function returned.
    expect(spy).toHaveReturned()
  })

  it('should initialize the gallery', async () => {
    // Create a mock contentRef with an element that contains the gallery.
    const contentRef = {
      current: document.createElement('div')
    }

    // Create a gallery element.
    const gallery = document.createElement('div')
    gallery.classList.add('grd-photo-gallery-grid')
    contentRef.current.appendChild(gallery)

    // Spy on galleryInit function.
    const spy = vi.fn(() => galleryInit(contentRef))
    await spy()

    // Verify that the function returned.
    expect(spy).toHaveReturned()
  })
})

describe('Blocks component tests', () => {
  it('should mount and then unmount without errors', () => {
    const {unmount} = render(<Blocks content={mockPost.content.rendered} />)
    unmount()
  })

  it('should not have any accessibility issues', async () => {
    const {container} = render(<Blocks content={mockPost.content.rendered} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    const {getByTestId} = render(<Blocks content={mockPost.content.rendered} />)
    const blocks = getByTestId('blocks')
    expect(blocks).toMatchSnapshot()
  })
})
