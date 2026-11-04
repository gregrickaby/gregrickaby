// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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

type Counts = Record<string, number>
const ZERO: Counts = { fire: 0, heart: 0, laugh: 0, wow: 0 }
interface Loaded {
  counts: Counts
  mine: string | null
}
/** Stands in for the server: one reaction per visitor, toggled like the real one. */
let server: Loaded
const reactToPost = vi.fn(async (_previous: unknown, data: FormData) => {
  const reaction = data.get('reaction') as string
  const counts = { ...server.counts }
  if (server.mine) counts[server.mine]! -= 1
  const mine = server.mine === reaction ? null : reaction
  if (mine) counts[mine]! += 1
  server = { counts, mine }
  return server
})
const getReactions = vi.fn(async () => server)
vi.mock('@/lib/react-to-post', () => ({ getReactions, reactToPost }))
const { Reactions } = await import('@/components/islands/reactions')
const { DeviceShare } = await import('@/components/islands/device-share')
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
    await act(async () => fireEvent.click(button))
    expect(writeText).toHaveBeenCalledWith('https://gregrickaby.com/post')
    expect(playSound).toHaveBeenCalledWith('select')
    expect(button.textContent).toBe('Copied')
    expect(screen.getByRole('status').textContent).toBe('Copied')
    act(() => vi.advanceTimersByTime(2000))
    expect(button.hasAttribute('data-copied')).toBe(false)
    expect(screen.getByRole('status').textContent).toBe('')
  })

  it('says so when the clipboard refuses', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error()) } })
    render(<CopyLink className="icon" url="https://gregrickaby.com/post" />)
    await act(async () => fireEvent.click(screen.getByRole('button')))
    expect(playSound).not.toHaveBeenCalled()
    expect(screen.getByRole('status').textContent).toBe('Could not copy')
    expect(screen.getByRole('button').textContent).toBe('Could not copy')
  })
})

describe('Reactions', () => {
  beforeEach(() => {
    server = { counts: { ...ZERO, heart: 4, laugh: 2, wow: 1, fire: 1 }, mine: null }
  })

  const pick = (name: string) =>
    screen.getByRole('button', { name: new RegExp(`^${name}`) }) as HTMLButtonElement
  const badge = (name: string) =>
    pick(name).querySelector('[aria-hidden="true"]:not(:first-child)')?.textContent ?? null

  async function click(element: HTMLElement) {
    await act(async () => {
      fireEvent.click(element)
    })
  }

  it('shows four emoji with their counts, then reacts with a coin and a burst', async () => {
    server.counts.wow = 0
    render(<Reactions slug="post" />)
    const form = screen.getByRole('form', { name: 'React to this post' })
    expect(within(form).getAllByRole('button')).toHaveLength(4)
    expect(await screen.findByRole('button', { name: 'Like, 4' })).toBeTruthy()
    expect(badge('Like')).toBe('4')
    expect(badge('Wow')).toBeNull()
    expect(screen.getByRole('button', { name: 'Wow' })).toBeTruthy()
    await click(pick('Like'))
    expect(playSound).toHaveBeenCalledWith('coin')
    expect(badge('Like')).toBe('5')
    expect(pick('Like').querySelectorAll('[style]')).toHaveLength(10)
    expect(pick('Like').getAttribute('aria-pressed')).toBe('true')
    expect(pick('Like').value).toBe('heart')
    expect(pick('Like').type).toBe('submit')
  })

  it('swaps the reaction', async () => {
    render(<Reactions slug="post" />)
    await screen.findByRole('button', { name: 'Like, 4' })
    await click(pick('Fire'))
    expect(badge('Fire')).toBe('2')
    await click(pick('Laugh'))
    expect(badge('Fire')).toBe('1')
    expect(badge('Laugh')).toBe('3')
    expect(pick('Laugh').getAttribute('aria-pressed')).toBe('true')
    expect(pick('Fire').getAttribute('aria-pressed')).toBe('false')
    expect(pick('Fire').querySelectorAll('[style]')).toHaveLength(0)
  })

  it('takes a reaction back with a closing sound', async () => {
    server.mine = 'wow'
    render(<Reactions slug="post" />)
    await screen.findByRole('button', { name: 'Wow, 1' })
    await click(pick('Wow'))
    expect(playSound).toHaveBeenCalledWith('close')
    expect(badge('Wow')).toBeNull()
    expect(pick('Wow').getAttribute('aria-pressed')).toBe('false')
    expect(pick('Wow').querySelectorAll('[style]')).toHaveLength(0)
  })

  it('shortens big counts and spells them out for screen readers', async () => {
    server = { counts: { ...ZERO, heart: 12345 }, mine: null }
    render(<Reactions slug="post" />)
    expect(await screen.findByRole('button', { name: 'Like, 12,345' })).toBeTruthy()
    expect(badge('Like')).toBe('12.3K')
  })

  it('shows no counts when they fail to load', async () => {
    getReactions.mockRejectedValueOnce(new Error('offline'))
    render(<Reactions slug="post" />)
    await act(async () => {})
    expect(screen.getByRole('button', { name: 'Like' })).toBeTruthy()
  })

  it("shows the action's answer when the counts never loaded", async () => {
    let finish = (_value: Loaded) => {}
    getReactions.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)))
    const { unmount } = render(<Reactions slug="post" />)
    await click(pick('Wow'))
    expect(pick('Wow').getAttribute('aria-pressed')).toBe('true')
    expect(badge('Wow')).toBe('2')
    unmount()
    await act(async () => finish(server))
  })

  it('ignores counts that land after unmount', async () => {
    render(<Reactions slug="post" />).unmount()
    await act(async () => {})
  })

  it('keeps the loaded counts when the server does not save a reaction', async () => {
    reactToPost.mockImplementationOnce(async (previous) => previous as never)
    render(<Reactions slug="post" />)
    await screen.findByRole('button', { name: 'Like, 4' })
    await click(pick('Like'))
    expect(badge('Like')).toBe('4')
    expect(pick('Like').getAttribute('aria-pressed')).toBe('false')
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

    function renderCued() {
      const view = render(
        <article>
          <span data-like-cue="" />
          <Reactions slug="post" />
        </article>,
      )
      const marker = view.container.querySelector('[data-like-cue]') as HTMLElement
      const form = view.container.querySelector('form') as HTMLElement
      const place = (element: HTMLElement, top: number) => {
        element.getBoundingClientRect = () => ({ bottom: top + 40, top }) as DOMRect
      }
      return { form, marker, place, unmount: view.unmount }
    }

    it('waves once the reader reaches the cue and the reactions are on screen, until a reaction', async () => {
      const { form, marker, place, unmount } = renderCued()
      await screen.findByRole('button', { name: 'Like, 4' })
      place(marker, 1200)
      place(form, 100)
      act(() => fire())
      expect(form.hasAttribute('data-cue')).toBe(false)
      place(marker, 400)
      place(form, 2000)
      act(() => fire())
      expect(form.hasAttribute('data-cue')).toBe(false)
      place(form, -100)
      act(() => fire())
      expect(form.hasAttribute('data-cue')).toBe(false)
      place(form, 100)
      act(() => fire())
      expect(form.hasAttribute('data-cue')).toBe(true)
      expect(form.querySelector('[aria-hidden="true"]')!.textContent).toBe('Psst!')
      expect(disconnect).toHaveBeenCalled()
      await click(pick('Fire'))
      expect(form.hasAttribute('data-cue')).toBe(false)
      expect(form.textContent).not.toContain('Psst!')
      unmount()
    })

    it('only asks readers who have not reacted yet', async () => {
      server.mine = 'wow'
      const { form, marker, place } = renderCued()
      await screen.findByRole('button', { name: 'Wow, 1' })
      place(marker, 400)
      place(form, 100)
      act(() => fire())
      expect(form.hasAttribute('data-cue')).toBe(false)
    })
  })
})

describe('DeviceShare', () => {
  afterEach(() => vi.unstubAllGlobals())

  it("opens the device's share sheet, and shrugs off a cancel", async () => {
    const share = vi.fn().mockRejectedValue(new Error('AbortError'))
    vi.stubGlobal('navigator', { share })
    render(<DeviceShare className="item" title="Post" url="https://gregrickaby.com/post" />)
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'More options' })))
    expect(share).toHaveBeenCalledWith({ title: 'Post', url: 'https://gregrickaby.com/post' })
  })

  it('renders nothing without a share sheet', () => {
    vi.stubGlobal('navigator', {})
    const { container } = render(
      <DeviceShare className="item" title="Post" url="https://gregrickaby.com/post" />,
    )
    expect(container.innerHTML).toBe('')
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
