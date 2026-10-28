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
const { CopyLink } = await import('@/components/islands/copy-link')
const { CopyMarkdown } = await import('@/components/islands/copy-markdown')

const likePost = vi.fn(async (previous: { count: number | null; mine: number }) => ({
  count: (previous.count ?? 4) + 1,
  mine: previous.mine + 1,
}))
const LIKES: Record<string, { count: number; mine: number }> = {
  post: { count: 4, mine: 0 },
  popular: { count: 10000, mine: 0 },
}
const getLikes = vi.fn(async (slug: string) => LIKES[slug] ?? { count: 12, mine: 10 })
vi.mock('@/lib/like-post', () => ({ getLikes, likePost }))
const { LikeButton } = await import('@/components/islands/like-button')
const { TableOfContents } = await import('@/components/islands/table-of-contents')

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

  it('marks a download for its animation, then clears it', () => {
    gallery()
    fireEvent.click(screen.getByAltText('one'))
    const download = screen.getByLabelText('Download original')
    download.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(download)
    expect(download.hasAttribute('data-saved')).toBe(true)
    fireEvent.animationEnd(download)
    expect(download.hasAttribute('data-saved')).toBe(false)
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

describe('CopyMarkdown', () => {
  class FakeClipboardItem {
    constructor(readonly items: Record<string, Promise<Blob>>) {}
  }

  function stubClipboard(
    write = vi.fn(async (items: FakeClipboardItem[]) => {
      await items[0]?.items['text/plain']
    }),
  ) {
    vi.stubGlobal('ClipboardItem', FakeClipboardItem)
    vi.stubGlobal('navigator', { clipboard: { write } })
    return write
  }

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('links to the Markdown file for readers without JavaScript', () => {
    render(<CopyMarkdown className="icon" slug="post" />)
    const link = screen.getByRole('link', { name: 'View as Markdown' })
    expect(link.getAttribute('href')).toBe('/post.md')
    expect(link.className).toContain('icon')
  })

  it("copies the post's Markdown, says so, then resets", async () => {
    vi.useFakeTimers()
    const fetch = vi.fn(async () => new Response('# Post\n'))
    vi.stubGlobal('fetch', fetch)
    const write = stubClipboard()
    render(<CopyMarkdown className="icon" slug="post" />)
    const button = screen.getByRole('button', { name: 'Copy as Markdown' })
    expect(button.dataset.tip).toBe('Copy as Markdown')
    await act(async () => fireEvent.click(button))
    expect(fetch).toHaveBeenCalledWith('/post.md')
    const blob = await write.mock.calls[0]?.[0][0]?.items['text/plain']
    expect(blob?.type).toBe('text/plain')
    expect(await blob?.text()).toBe('# Post\n')
    expect(playSound).toHaveBeenCalledWith('select')
    expect(button.dataset.tip).toBe('Copied')
    expect(button.hasAttribute('data-copied')).toBe(true)
    expect(screen.getByRole('status').textContent).toBe('Copied')
    act(() => vi.advanceTimersByTime(2000))
    expect(button.dataset.tip).toBe('Copy as Markdown')
    expect(button.hasAttribute('data-copied')).toBe(false)
    expect(screen.getByRole('status').textContent).toBe('')
  })

  it('says so when the file is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('Not found', { status: 404 })),
    )
    stubClipboard()
    render(<CopyMarkdown className="icon" slug="gone" />)
    await act(async () => fireEvent.click(screen.getByRole('button')))
    expect(playSound).not.toHaveBeenCalled()
    expect(screen.getByRole('status').textContent).toBe('Could not copy')
  })

  it('says so when the clipboard refuses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('# Post')),
    )
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    render(<CopyMarkdown className="icon" slug="post" />)
    await act(async () => fireEvent.click(screen.getByRole('button')))
    expect(screen.getByRole('status').textContent).toBe('Could not copy')
    expect(screen.getByRole('button').dataset.tip).toBe('Could not copy')
  })
})

describe('CopyLink', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("copies the post's URL, says so, then resets", async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    render(<CopyLink className="icon" url="https://gregrickaby.com/post" />)
    const button = screen.getByRole('button', { name: 'Copy link' })
    expect(button.className).toContain('icon')
    expect(button.dataset.tip).toBe('Copy link')
    await act(async () => fireEvent.click(button))
    expect(writeText).toHaveBeenCalledWith('https://gregrickaby.com/post')
    expect(playSound).toHaveBeenCalledWith('select')
    expect(button.dataset.tip).toBe('Copied')
    expect(button.hasAttribute('data-copied')).toBe(true)
    expect(screen.getByRole('status').textContent).toBe('Copied')
    act(() => vi.advanceTimersByTime(2000))
    expect(button.dataset.tip).toBe('Copy link')
    expect(button.hasAttribute('data-copied')).toBe(false)
    expect(screen.getByRole('status').textContent).toBe('')
  })

  it('says so when the clipboard refuses', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error()) } })
    render(<CopyLink className="icon" url="https://gregrickaby.com/post" />)
    await act(async () => fireEvent.click(screen.getByRole('button')))
    expect(playSound).not.toHaveBeenCalled()
    expect(screen.getByRole('status').textContent).toBe('Could not copy')
    expect(screen.getByRole('button').dataset.tip).toBe('Could not copy')
  })
})

describe('LikeButton', () => {
  const fill = (button: HTMLElement) =>
    (button.querySelector('[style]') as HTMLElement).style.getPropertyValue('--fill')

  it('loads the count, then likes the post with a sound and a burst', async () => {
    render(<LikeButton slug="post" />)
    const button = screen.getByRole('button')
    expect(button.textContent).toBe('Like this post')
    expect(button.dataset.tip).toBe('Hit the ? block!')
    expect(await screen.findByText('4')).toBeTruthy()
    expect(button.textContent).toContain('4 likes. Like this post')
    expect(fill(button)).toBe('0')
    await act(async () => {
      fireEvent.click(button)
    })
    expect(playSound).toHaveBeenCalledWith('coin')
    expect(button.querySelectorAll('[aria-hidden="true"] > [style]')).toHaveLength(10)
    expect(button.textContent).toContain('5 likes. Like this post again (1 of 10)')
    expect(fill(button)).toBe('0.1')
    expect(button.dataset.tip).toBe('x1 coins! Hit it again')
    expect((button as HTMLButtonElement).disabled).toBe(false)
  })

  it('groups the thousands in a big count', async () => {
    render(<LikeButton slug="popular" />)
    expect(await screen.findByText('10,000')).toBeTruthy()
  })

  it('bursts again on each like', async () => {
    render(<LikeButton slug="post" />)
    const button = screen.getByRole('button')
    await act(async () => {
      fireEvent.click(button)
    })
    const first = button.querySelector('[aria-hidden="true"] > [style]')
    await act(async () => {
      fireEvent.click(button)
    })
    expect(button.querySelector('[aria-hidden="true"] > [style]')).not.toBe(first)
    expect(button.textContent).toContain('(2 of 10)')
  })

  it('plays a fanfare for the tenth like', async () => {
    getLikes.mockResolvedValueOnce({ count: 20, mine: 9 })
    render(<LikeButton slug="post" />)
    expect(await screen.findByText('20')).toBeTruthy()
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })
    expect(playSound).toHaveBeenCalledWith('fanfare')
    expect(playSound).not.toHaveBeenCalledWith('coin')
  })

  it('fills the heart and stops at ten likes', async () => {
    render(<LikeButton slug="other" />)
    expect(await screen.findByText('12')).toBeTruthy()
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.textContent).toContain('12 likes. You liked this post 10 times')
    expect(fill(button)).toBe('1')
    expect(button.dataset.tip).toBe('Course clear!')
    expect(button.disabled).toBe(true)
  })

  it('says one like', async () => {
    getLikes.mockResolvedValueOnce({ count: 1, mine: 1 })
    render(<LikeButton slug="post" />)
    expect(await screen.findByText('1')).toBeTruthy()
    expect(screen.getByRole('button').textContent).toContain('1 like. Like this post again')
  })

  it('shows no count when it fails to load, and ignores a count that lands after unmount', async () => {
    getLikes.mockRejectedValueOnce(new Error('offline'))
    const { unmount } = render(<LikeButton slug="post" />)
    await act(async () => {})
    expect(screen.getByRole('button').textContent).toBe('Like this post')
    unmount()
    render(<LikeButton slug="post" />).unmount()
    await act(async () => {})
  })

  describe('like cue', () => {
    let fire: () => void
    const disconnect = vi.fn()

    beforeEach(() => {
      vi.stubGlobal('innerHeight', 900)
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(callback: () => void) {
            fire = callback
          }
          observe() {}
          disconnect = disconnect
        },
      )
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    function renderCued(slug = 'post') {
      const view = render(
        <article>
          <span data-like-cue="" />
          <LikeButton slug={slug} />
        </article>,
      )
      const marker = view.container.querySelector('[data-like-cue]') as HTMLElement
      const button = screen.getByRole('button')
      const place = (element: HTMLElement, top: number, height = 40) => {
        element.getBoundingClientRect = () => ({ bottom: top + height, height, top }) as DOMRect
      }
      return { button, marker, place, unmount: view.unmount }
    }

    it('waves once the reader reaches the cue and the button is on screen, until liked', async () => {
      const { button, marker, place, unmount } = renderCued()
      expect(await screen.findByText('4')).toBeTruthy()
      place(marker, 1200)
      place(button, 100)
      act(() => fire())
      expect(button.hasAttribute('data-cue')).toBe(false)
      place(marker, 400)
      place(button, 2000)
      act(() => fire())
      expect(button.hasAttribute('data-cue')).toBe(false)
      place(button, 100, 0)
      act(() => fire())
      expect(button.hasAttribute('data-cue')).toBe(false)
      place(button, -100)
      act(() => fire())
      expect(button.hasAttribute('data-cue')).toBe(false)
      place(button, 100)
      act(() => fire())
      expect(button.hasAttribute('data-cue')).toBe(true)
      expect(button.querySelector('[aria-hidden="true"]')!.textContent).toBe('Psst!')
      expect(disconnect).toHaveBeenCalled()
      await act(async () => {
        fireEvent.click(button)
      })
      expect(button.hasAttribute('data-cue')).toBe(false)
      expect(button.textContent).not.toContain('Psst!')
      unmount()
    })

    it('only asks readers who have not liked the post yet', async () => {
      getLikes.mockResolvedValueOnce({ count: 5, mine: 3 })
      const { button, marker, place } = renderCued()
      expect(await screen.findByText('5')).toBeTruthy()
      place(marker, 400)
      place(button, 100)
      act(() => fire())
      expect(button.hasAttribute('data-cue')).toBe(false)
    })

    it('stays still once the post has all ten likes', async () => {
      const { button, marker, place } = renderCued('other')
      expect(await screen.findByText('12')).toBeTruthy()
      place(marker, 400)
      place(button, 100)
      act(() => fire())
      expect(button.hasAttribute('data-cue')).toBe(false)
    })
  })

  it('keeps the loaded count when the server does not save a like', async () => {
    likePost.mockImplementationOnce(async (previous) => previous as never)
    render(<LikeButton slug="post" />)
    expect(await screen.findByText('4')).toBeTruthy()
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })
    expect(screen.getByRole('button').textContent).toContain('4 likes. Like this post')
  })
})

describe('TableOfContents', () => {
  const headings = [
    { id: 'one', text: 'One', depth: 2 as const },
    { id: 'two', text: 'Two', depth: 3 as const },
    { id: 'gone', text: 'Gone', depth: 2 as const },
  ]
  let fire: () => void
  const disconnect = vi.fn()

  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: () => void) {
          fire = callback
        }
        observe() {}
        disconnect = disconnect
      },
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  function place(id: string, top: number) {
    const heading = document.createElement('h2')
    heading.id = id
    heading.getBoundingClientRect = () => ({ top }) as DOMRect
    document.body.append(heading)
  }

  it('links each heading, nesting h3s, and marks the section being read', () => {
    vi.stubGlobal('innerHeight', 900)
    place('one', -400)
    place('two', 200)
    const { unmount } = render(<TableOfContents headings={headings} />)
    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeTruthy()
    const links = screen.getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#one', '#two', '#gone'])
    expect(links[1]!.parentElement!.className).toBe('sub')
    expect(links.some((link) => link.hasAttribute('aria-current'))).toBe(false)
    act(() => fire())
    expect(links[1]!.getAttribute('aria-current')).toBe('location')
    expect(links[0]!.hasAttribute('aria-current')).toBe(false)
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('marks nothing above the first heading', () => {
    vi.stubGlobal('innerHeight', 900)
    place('one', 600)
    render(<TableOfContents headings={headings} />)
    act(() => fire())
    expect(screen.getAllByRole('link').some((link) => link.hasAttribute('aria-current'))).toBe(
      false,
    )
  })
})
