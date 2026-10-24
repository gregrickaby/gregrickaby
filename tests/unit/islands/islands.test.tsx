// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let pathname = '/'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

const playSound = vi.fn()
vi.mock('@/components/islands/sounds', () => ({ playSound }))

const { ThemeToggle } = await import('@/components/islands/theme-toggle')
const { MobileMenu } = await import('@/components/islands/mobile-menu')
const { Lightbox, toSlide } = await import('@/components/islands/lightbox')
const { CodeCopy } = await import('@/components/islands/code-copy')

const likePost = vi.fn(async (_: unknown, data: FormData) => ({
  count: data.get('slug') === 'post' ? 5 : 0,
  liked: true,
}))
const getLikeCount = vi.fn(async (slug: string) => (slug === 'post' ? 4 : 1))
vi.mock('@/lib/like-post', () => ({ getLikeCount, likePost }))
const { LikeButton } = await import('@/components/islands/like-button')

afterEach(() => {
  cleanup()
  playSound.mockClear()
  document.documentElement.removeAttribute('data-theme')
  document.cookie = 'theme=; max-age=0; path=/'
  localStorage.clear()
})

describe('ThemeToggle', () => {
  function stubSystem(dark: boolean) {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: dark && q.includes('dark') }))
  }

  it('switches from the system scheme to the other one and saves it', () => {
    stubSystem(true)
    document.documentElement.dataset.theme = 'system'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: /Switch to/ }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.cookie).toContain('theme=light')
    expect(playSound).toHaveBeenCalledWith('switch-on')
  })

  it('marks the switch for its animation, then clears it', () => {
    stubSystem(false)
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button.hasAttribute('data-switched')).toBe(false)
    fireEvent.click(button)
    expect(button.hasAttribute('data-switched')).toBe(true)
    fireEvent.animationEnd(button)
    expect(button.hasAttribute('data-switched')).toBe(false)
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

  it('plays a sound as the popover opens and closes', () => {
    render(<MobileMenu>links</MobileMenu>)
    const panel = document.getElementById('site-menu') as HTMLElement
    for (const newState of ['open', 'closed']) {
      panel.dispatchEvent(Object.assign(new Event('toggle'), { newState }))
    }
    expect(playSound.mock.calls).toEqual([['open'], ['close']])
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

  it('plays sounds to open, step, and close', () => {
    gallery()
    fireEvent.click(screen.getByAltText('one'))
    fireEvent.click(screen.getByLabelText('Next image'))
    dialog().dispatchEvent(new Event('close'))
    expect(playSound.mock.calls).toEqual([['shutter'], ['step'], ['close']])
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

describe('PrintButton', () => {
  it('blips, then opens the print dialog', async () => {
    const { PrintButton } = await import('@/components/islands/print-button')
    const print = vi.fn()
    vi.stubGlobal('print', print)
    render(<PrintButton className="x" />)
    fireEvent.click(screen.getByRole('button', { name: 'Save as PDF' }))
    expect(playSound.mock.calls).toEqual([['select']])
    expect(print).toHaveBeenCalled()
    cleanup()
    render(<PrintButton />)
    expect(screen.getByRole('button').className).not.toContain('x')
  })
})

describe('CodeCopy', () => {
  function renderBlock() {
    return render(
      <CodeCopy>
        <figure>
          <pre>
            <code>const a = 1</code>
          </pre>
          <button aria-label="Copy code" data-copy="" type="button" />
        </figure>
        <p>Text</p>
      </CodeCopy>,
    )
  }

  afterEach(() => {
    vi.useRealTimers()
  })

  it('copies the block, shows a check, then resets', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    renderBlock()
    const button = screen.getByRole('button', { name: 'Copy code' })
    await act(async () => fireEvent.click(button))
    expect(writeText).toHaveBeenCalledWith('const a = 1')
    expect(playSound).toHaveBeenCalledWith('copy')
    expect(button.hasAttribute('data-copied')).toBe(true)
    expect(screen.getByRole('status').textContent).toBe('Copied to clipboard')
    act(() => vi.advanceTimersByTime(2000))
    expect(button.hasAttribute('data-copied')).toBe(false)
    expect(screen.getByRole('status').textContent).toBe('')
  })

  it('says so when the clipboard refuses', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error()) } })
    renderBlock()
    const button = screen.getByRole('button', { name: 'Copy code' })
    await act(async () => fireEvent.click(button))
    expect(button.hasAttribute('data-copied')).toBe(false)
    expect(screen.getByRole('status').textContent).toBe('Could not copy')
  })

  it('ignores clicks outside a copy button', async () => {
    const writeText = vi.fn()
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    renderBlock()
    await act(async () => fireEvent.click(screen.getByText('Text')))
    expect(writeText).not.toHaveBeenCalled()
  })
})

describe('LikeButton', () => {
  it('loads the count, then likes the post, plays a sound, and remembers it', async () => {
    render(<LikeButton slug="post" />)
    const button = screen.getByRole('button')
    expect(button.textContent).toBe('Like this post')
    expect(await screen.findByText('4')).toBeTruthy()
    expect(button.textContent).toContain('4 likes. Like this post')
    await act(async () => {
      fireEvent.click(button)
    })
    expect(playSound).toHaveBeenCalledWith('coin')
    expect(button.textContent).toContain('5 likes. You liked this post')
    expect((button as HTMLButtonElement).disabled).toBe(true)
    expect(localStorage.getItem('liked:post')).toBe('yes')
  })

  it('starts filled when this browser liked the post before', async () => {
    localStorage.setItem('liked:other', 'yes')
    render(<LikeButton slug="other" />)
    expect(await screen.findByText('1')).toBeTruthy()
    expect(screen.getByRole('button').textContent).toContain('1 like. You liked this post')
  })

  it('shows no count when it fails to load, and ignores a count that lands after unmount', async () => {
    getLikeCount.mockRejectedValueOnce(new Error('offline'))
    const { unmount } = render(<LikeButton slug="post" />)
    await act(async () => {})
    expect(screen.getByRole('button').textContent).toBe('Like this post')
    unmount()
    render(<LikeButton slug="post" />).unmount()
    await act(async () => {})
  })

  it('forgets a like the server did not save', async () => {
    likePost.mockImplementationOnce(async (previous) => previous as never)
    render(<LikeButton slug="post" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })
    expect(screen.getByRole('button').textContent).toContain('Like this post')
    expect(localStorage.getItem('liked:post')).toBeNull()
  })

  it('still likes when storage throws', async () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    render(<LikeButton slug="other" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })
    expect(screen.getByRole('button').textContent).toContain('You liked this post')
  })
})
