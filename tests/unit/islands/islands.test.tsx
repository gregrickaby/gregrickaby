// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let pathname = '/'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

const action = vi.fn()
vi.mock('@/app/actions/contact', () => ({ sendContactEmail: action }))

const { ThemeToggle } = await import('@/components/islands/theme-toggle')
const { MobileMenu } = await import('@/components/islands/mobile-menu')
const { Lightbox, toSlide } = await import('@/components/islands/lightbox')
const { ContactForm } = await import('@/components/islands/contact-form')

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-theme')
  document.cookie = 'theme=; max-age=0; path=/'
})

describe('ThemeToggle', () => {
  function stubSystem(dark: boolean) {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: dark && q.includes('dark') }))
  }

  it('switches from the system scheme to the other one and saves it', () => {
    stubSystem(true)
    document.documentElement.dataset.theme = 'system'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Toggle color scheme' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.cookie).toContain('theme=light')
  })

  it('reads a light system scheme', () => {
    stubSystem(false)
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('flips a saved choice', () => {
    stubSystem(false)
    document.documentElement.dataset.theme = 'dark'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.dataset.theme).toBe('light')
    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})

describe('MobileMenu', () => {
  it('opens a native popover and closes it after a navigation', () => {
    const { rerender } = render(<MobileMenu>links</MobileMenu>)
    expect(
      screen.getByRole('button', { name: 'Open navigation menu' }).getAttribute('popovertarget'),
    ).toBe('site-menu')

    const panel = document.getElementById('site-menu') as HTMLElement
    let open = true
    const hide = vi.fn()
    panel.matches = (() => open) as unknown as HTMLElement['matches']
    panel.hidePopover = hide

    pathname = '/blog'
    rerender(<MobileMenu>links</MobileMenu>)
    expect(hide).toHaveBeenCalledTimes(1)

    open = false
    pathname = '/photos'
    rerender(<MobileMenu>links</MobileMenu>)
    expect(hide).toHaveBeenCalledTimes(1)
  })
})

describe('Lightbox', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open')
    }
  })

  function gallery() {
    return render(
      <Lightbox>
        <a
          data-caption="First"
          data-details="f/2"
          data-full="/full/1.jpg"
          data-lightbox=""
          href="/o/1.jpg"
        >
          <img alt="one" src="/t/1.jpg" />
        </a>
        <figure>
          <img alt="two" data-full="/full/2.jpg" data-lightbox="" src="/t/2.jpg" />
          <figcaption> Second </figcaption>
        </figure>
        <img alt="three" data-lightbox="" src="/t/3.jpg" />
        <span>not an image</span>
      </Lightbox>,
    )
  }

  const dialog = () => document.querySelector('dialog') as HTMLDialogElement

  it('opens the clicked image with its caption, details, and download', () => {
    gallery()
    fireEvent.click(screen.getByAltText('one'))
    expect(dialog().hasAttribute('open')).toBe(true)
    const viewer = dialog()
    expect(viewer.querySelector('img')?.getAttribute('src')).toBe('/full/1.jpg')
    expect(viewer.textContent).toContain('First')
    expect(viewer.textContent).toContain('f/2')
    expect(viewer.textContent).toContain('1 of 3')
    expect(screen.getByLabelText('Download original').getAttribute('href')).toBe('/o/1.jpg')
  })

  it('moves with buttons, arrow keys, and swipes, wrapping at the ends', () => {
    gallery()
    fireEvent.click(screen.getByAltText('two'))
    expect(dialog().textContent).toContain('Second')
    fireEvent.click(screen.getByLabelText('Next image'))
    expect(dialog().textContent).toContain('3 of 3')
    fireEvent.keyDown(dialog(), { key: 'ArrowRight' })
    expect(dialog().textContent).toContain('1 of 3')
    fireEvent.keyDown(dialog(), { key: 'ArrowLeft' })
    expect(dialog().textContent).toContain('3 of 3')
    fireEvent.click(screen.getByLabelText('Previous image'))
    expect(dialog().textContent).toContain('2 of 3')
    fireEvent.keyDown(dialog(), { key: 'Enter' })
    expect(dialog().textContent).toContain('2 of 3')

    fireEvent.touchStart(dialog(), { touches: [{ clientX: 300 }] })
    fireEvent.touchEnd(dialog(), { changedTouches: [{ clientX: 100 }] })
    expect(dialog().textContent).toContain('3 of 3')
    fireEvent.touchStart(dialog(), { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(dialog(), { changedTouches: [{ clientX: 300 }] })
    expect(dialog().textContent).toContain('2 of 3')
    // Short swipes and swipes without a start are taps.
    fireEvent.touchStart(dialog(), { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(dialog(), { changedTouches: [{ clientX: 120 }] })
    fireEvent.touchEnd(dialog(), { changedTouches: [{ clientX: 500 }] })
    fireEvent.touchStart(dialog(), { touches: [] })
    fireEvent.touchEnd(dialog(), { changedTouches: [] })
    expect(dialog().textContent).toContain('2 of 3')
  })

  it('closes from the button or a backdrop click, not a click on the image', () => {
    gallery()
    const trigger = () => screen.getAllByAltText('three')[0] as HTMLImageElement
    fireEvent.click(trigger())
    fireEvent.click(dialog().querySelector('img') as HTMLImageElement)
    expect(dialog().hasAttribute('open')).toBe(true)
    fireEvent.click(dialog())
    expect(dialog().hasAttribute('open')).toBe(false)
    fireEvent.click(trigger())
    fireEvent.click(screen.getByLabelText('Close'))
    expect(dialog().hasAttribute('open')).toBe(false)
  })

  it('ignores modified clicks and clicks outside triggers', () => {
    gallery()
    fireEvent.click(screen.getByAltText('one'), { metaKey: true })
    fireEvent.click(screen.getByAltText('one'), { button: 1 })
    fireEvent.click(screen.getByText('not an image'))
    expect(dialog().hasAttribute('open')).toBe(false)
  })

  it('hides navigation for a single image', () => {
    render(
      <Lightbox>
        <img alt="solo" data-lightbox="" src="/solo.jpg" title="Solo" />
      </Lightbox>,
    )
    fireEvent.click(screen.getByAltText('solo'))
    expect(screen.queryByLabelText('Next image')).toBeNull()
    expect(dialog().textContent).toContain('Solo')
    expect(dialog().textContent).not.toContain('of 1')
  })

  it('shows no caption for an untitled photo', () => {
    render(
      <Lightbox>
        <a data-lightbox="" href="/plain.jpg">
          <img alt="" src="/t/plain.jpg" />
        </a>
      </Lightbox>,
    )
    fireEvent.click(document.querySelector('a') as HTMLAnchorElement)
    expect(dialog().querySelector('figcaption')?.textContent).toBe('')
  })

  it('has no caption for a figure without one and an image without alt text', () => {
    const figure = document.createElement('figure')
    const img = document.createElement('img')
    figure.append(img)
    expect(toSlide(img).caption).toBeUndefined()
  })

  it('prefers the image the browser chose', () => {
    const img = document.createElement('img')
    Object.defineProperty(img, 'currentSrc', { value: 'http://localhost/chosen.jpg' })
    expect(toSlide(img).src).toBe('http://localhost/chosen.jpg')
  })

  it('reads slides from bare elements', () => {
    const link = document.createElement('a')
    expect(toSlide(link)).toEqual({
      src: '',
      alt: '',
      caption: undefined,
      details: undefined,
      download: undefined,
    })
    const img = document.createElement('img')
    img.src = 'http://localhost/x.jpg'
    expect(toSlide(img)).toMatchObject({ src: 'http://localhost/x.jpg', caption: undefined })
  })
})

describe('ContactForm', () => {
  it('shows every field and posts to the action', async () => {
    action.mockResolvedValue({ success: false, error: 'All fields are required.' })
    render(<ContactForm />)
    for (const label of ['Name', 'Email', 'How can I help?', 'Message']) {
      expect(screen.getByLabelText(label)).toBeTruthy()
    }
    expect(screen.getAllByRole('option')).toHaveLength(6)
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Send Message' }).closest('form')!)
    })
    expect(action).toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toBe('All fields are required.')
  })

  it('thanks the sender on success', async () => {
    action.mockResolvedValue({ success: true, error: null })
    render(<ContactForm />)
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Send Message' }).closest('form')!)
    })
    expect(screen.getByRole('status').textContent).toContain('Message sent!')
  })
})
