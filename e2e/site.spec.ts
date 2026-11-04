import { AxeBuilder } from '@axe-core/playwright'
import { instant } from '@next/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * Collects Content-Security-Policy violations and uncaught errors, and with
 * `errors`, every console error too.
 */
function watchConsole(page: Page, { errors = false } = {}) {
  const problems: string[] = []
  page.on('console', (message) => {
    const text = message.text()
    if (/Content Security Policy/i.test(text) || (errors && message.type() === 'error')) {
      problems.push(text)
    }
  })
  page.on('pageerror', (error) => problems.push(error.message))
  return problems
}

/** Every path in the sitemap, which lists the pages, posts, tags, and categories. */
async function getSitemapPaths(page: Page) {
  const xml = await (await page.request.get('/sitemap.xml')).text()
  return [...xml.matchAll(/<loc>https:\/\/gregrickaby\.com([^<]*)<\/loc>/g)].map(
    (match) => match[1] || '/',
  )
}

/** Scrolls to the bottom and back, so every element that fades in on scroll is showing. */
async function revealAll(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    window.scrollTo(0, 0)
  })
}

test.describe('reading', () => {
  test('home, blog, and a post, with an instant client navigation', async ({ page }) => {
    const problems = watchConsole(page)
    const response = await page.goto('/')
    expect(response?.headers()['content-security-policy']).toContain("default-src 'self'")
    await expect(page.getByRole('heading', { level: 1, name: 'Greg Rickaby' })).toBeVisible()

    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Blog' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()

    // Post links prefetch the prerendered page, so the whole article paints at once.
    const first = page.locator('main article h2 a').first()
    const title = (await first.textContent())!.trim()
    await first.hover()
    await page.waitForLoadState('networkidle')
    await instant(page, async () => {
      await first.click()
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
      await expect(page.locator('main .prose:visible')).toBeVisible()
    })
    await expect(page.getByRole('navigation', { name: 'More posts' })).toBeVisible()
    expect(problems).toEqual([])
  })

  test('the home page leads to the resume, writing, and photos', async ({ page }) => {
    await page.goto('/')
    const start = page.getByRole('navigation', { name: 'Start here' })
    await expect(start.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/resume')
    await expect(page.getByRole('heading', { level: 2, name: "Where I've worked" })).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Latest from the blog' }),
    ).toBeVisible()

    // The career row scrolls sideways; its left button shows only after the first step.
    const left = page.getByRole('button', { name: 'Scroll roles left' })
    await expect(left).toHaveCount(0)
    await page.getByRole('button', { name: 'Scroll roles right' }).click()
    await expect(left).toBeVisible()

    await page.locator('main a[data-lightbox]').first().click()
    await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeVisible()
  })

  test('the resume prints without the site chrome', async ({ page }) => {
    await page.goto('/resume')
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('header').first()).toBeHidden()
    await expect(page.getByRole('button', { name: 'Save as PDF' })).toBeHidden()
    await expect(page.getByText('gregrickaby.com · linkedin.com/in/gregrickaby')).toBeVisible()
  })

  test('tags and categories list their posts', async ({ page }) => {
    await page.goto('/the-moons-of-2023')
    await page.getByRole('link', { name: 'photography', exact: true }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Tag: photography' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'The Moons of 2023' })).toBeVisible()

    await page.goto('/category/Code')
    await expect(page.getByRole('heading', { level: 1, name: 'Category: Code' })).toBeVisible()
  })

  test('post images open in the lightbox and step with the keyboard', async ({ page }) => {
    await page.goto('/the-moons-of-2023')
    await page.locator('.prose img').first().click()
    const viewer = page.getByRole('dialog', { name: 'Image viewer' })
    await expect(viewer).toBeVisible()
    await expect(viewer).toContainText(/1 of \d+/)
    await page.keyboard.press('ArrowRight')
    await expect(viewer).toContainText(/2 of \d+/)
    await page.keyboard.press('Escape')
    await expect(viewer).toBeHidden()
  })

  test('a post copies its Markdown, which lives at its .md URL', async ({
    context,
    page,
    request,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/the-moons-of-2023')
    await expect(page.locator('link[rel="alternate"][type="text/markdown"]')).toHaveAttribute(
      'href',
      /\/the-moons-of-2023\.md$/,
    )
    await page.getByRole('button', { name: 'Copy as Markdown' }).first().click()
    await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toHaveCount(1)
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toMatch(/^# The Moons of 2023\n/)

    const file = await request.get('/the-moons-of-2023.md')
    expect(file.headers()['content-type']).toBe('text/markdown; charset=utf-8')
    expect(await file.text()).toBe(copied)
    expect((await request.get('/no-such-post.md')).status()).toBe(404)
  })

  test('a post copies its link', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/the-moons-of-2023')
    await page.getByRole('button', { name: 'Share' }).first().click()
    await page.getByRole('button', { name: 'Copy link' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toHaveCount(1)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'https://gregrickaby.com/the-moons-of-2023',
    )
  })

  test('the HDR post keeps its gain-map originals', async ({ page }) => {
    await page.goto('/how-gain-maps-elevate-hdr-photography')
    const hdr = page.locator(
      '.prose img[src$="Indiana-Jones-Epic-Stunt-Spectacular_HDR_20221205.jpg"]',
    )
    await expect(hdr).toHaveAttribute('src', /^\/content\/posts\//)
    const sdr = page.locator('.prose img[src*="Indiana-Jones-Epic-Stunt-Spectacular_SDR_"]')
    await expect(sdr).toHaveAttribute('src', /^\/_next\/image/)
  })
})

test.describe('photos', () => {
  test('the gallery opens photos with EXIF details and a download', async ({ page }) => {
    await page.goto('/photos')
    await page.locator('main a[data-lightbox]').first().click()
    const viewer = page.getByRole('dialog', { name: 'Image viewer' })
    await expect(viewer).toBeVisible()
    await expect(viewer.getByRole('link', { name: 'Download original' })).toHaveAttribute(
      'href',
      /^\/content\/photos\//,
    )
    await viewer.getByRole('button', { name: 'Next image' }).click()
    await expect(viewer).toContainText(/2 of \d+/)
    await viewer.getByRole('button', { name: 'Close' }).click()
    await expect(viewer).toBeHidden()
  })

  test('the gallery links to the gear page, with its affiliate note', async ({ page }) => {
    await page.goto('/photos')
    await page.getByRole('link', { name: "Here's my gear." }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Camera gear' })).toBeVisible()
    await expect(page.getByRole('note', { name: 'Affiliate disclaimer' })).toContainText(
      'Amazon Associate',
    )
  })
})

test.describe('search and theme', () => {
  test('header search finds posts', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('searchbox', { name: 'Search posts' }).first().fill('moon')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=moon/)
    await expect(page.getByRole('status')).toContainText('match')
    await expect(page.getByRole('link', { name: 'The Moons of 2023' })).toBeVisible()
  })

  test('typing in the header search leaves the page where it is', async ({ page }) => {
    await page.goto('/')
    await page.mouse.wheel(0, 1500)
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000)
    const before = await page.evaluate(() => scrollY)
    await page.getByRole('searchbox', { name: 'Search posts' }).first().pressSequentially('moon')
    expect(await page.evaluate(() => scrollY)).toBe(before)
  })

  test('the theme choice survives a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await page.getByRole('button', { name: 'Switch to dark theme' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
})

test.describe('reactions', () => {
  test('a reaction counts, swaps, and survives a reload', async ({ page }) => {
    await page.goto('/displaying-exif-data-in-wordpress')
    const toolbar = page.getByRole('form', { name: 'React to this post' })
    const like = toolbar.getByRole('button', { name: /^Like/ })
    const fire = toolbar.getByRole('button', { name: /^Fire/ })
    await like.click()
    await expect(like).toHaveAttribute('aria-pressed', 'true')
    await expect(like).toHaveAccessibleName(/^Like, \d/)
    await fire.click()
    await expect(fire).toHaveAttribute('aria-pressed', 'true')
    await expect(like).toHaveAttribute('aria-pressed', 'false')
    await page.reload()
    await expect(fire).toHaveAttribute('aria-pressed', 'true')
    await expect(fire).toHaveAccessibleName(/^Fire, \d/)
  })
})

test.describe('table of contents', () => {
  test('links to each section', async ({ page }) => {
    await page.goto('/using-the-golden-ratio-and-rems')
    const contents = page.getByRole('navigation', { name: 'Table of contents' })
    await expect(contents).toBeVisible()
    const link = contents.getByRole('link').nth(2)
    const target = (await link.getAttribute('href'))!
    await link.click()
    await expect(page).toHaveURL(new RegExp(`${target}$`))
    await expect(page.locator(target)).toBeInViewport()
    await expect(link).toHaveAttribute('aria-current', 'location')
  })
})

test.describe('platform', () => {
  test('pages share generated images', async ({ page, request }) => {
    await page.goto('/the-moons-of-2023')
    const image = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(image).toContain('/the-moons-of-2023/opengraph-image')
    const response = await request.get(new URL(image!).pathname)
    expect(response.headers()['content-type']).toBe('image/png')
  })

  test('feeds, redirects, and 404s', async ({ page, request }) => {
    const feed = await request.get('/feed.xml')
    expect(feed.headers()['content-type']).toContain('application/rss+xml')
    expect(await feed.text()).toContain('<rss version="2.0"')
    expect((await request.get('/sitemap.xml')).ok()).toBe(true)

    const llms = await request.get('/llms.txt')
    expect(llms.headers()['content-type']).toContain('text/markdown')
    const post = await request.get('/the-moons-of-2023')
    expect(post.headers()['link']).toContain('</llms.txt>; rel="describedby"')
    const firstPost = (await llms.text()).match(
      /^- \[.+?\]\((https:\/\/gregrickaby\.com\/[^)]+\.md)\)/m,
    )
    expect(firstPost).not.toBeNull()
    expect((await request.get(new URL(firstPost![1]!).pathname)).ok()).toBe(true)
    for (const path of ['/resume.md', '/photos.md']) {
      const markdown = await request.get(path)
      expect(markdown.headers()['content-type']).toContain('text/markdown')
    }

    const geocities = await request.get('/geocities')
    const retro = await geocities.text()
    expect(retro).toContain('Mr. Data, report...')
    expect(retro).toContain('<meta name="robots" content="noindex, nofollow"')
    expect(retro).not.toContain('<audio')

    await page.goto('/about')
    await expect(page).toHaveURL(/\/$/)
    expect((await request.get('/feed')).url()).toMatch(/\/feed\.xml$/)
    const favicon = await request.get('/favicon.ico')
    expect(favicon.headers()['content-type']).toContain('image/jpeg')
    const missing = await page.goto('/no-such-post')
    expect(missing?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('banner')).toHaveCount(1)

    const gone = await page.goto('/tag/ubuntu')
    expect(gone?.status()).toBe(410)
    await expect(page).toHaveURL(/\/tag\/ubuntu$/)
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()
  })
})

test.describe('every page', () => {
  test('every sitemap page loads with no errors or CSP violations', async ({ page }) => {
    test.setTimeout(180_000)
    const paths = await getSitemapPaths(page)
    expect(paths.length).toBeGreaterThan(20)
    const problems = watchConsole(page, { errors: true })
    for (const path of paths) {
      const response = await page.goto(path, { waitUntil: 'networkidle' })
      expect(response?.status(), path).toBe(200)
      expect(problems, path).toEqual([])
    }
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test.describe(`${colorScheme} mode`, () => {
      // Reduced motion skips the fade-ins, which axe would read as low contrast mid-animation.
      test.use({ colorScheme, reducedMotion: 'reduce' })

      test(`key pages pass axe's WCAG AA checks in ${colorScheme} mode`, async ({ page }) => {
        test.setTimeout(180_000)
        for (const path of [
          '/',
          '/blog',
          '/photos',
          '/gear',
          '/resume',
          '/contact',
          '/the-moons-of-2023',
          '/8-bit-sound-effects-with-the-web-audio-api',
          '/how-gain-maps-elevate-hdr-photography',
          '/how-to-use-the-gamepad-api',
          '/no-such-page',
        ]) {
          await page.goto(path, { waitUntil: 'networkidle' })
          await revealAll(page)
          const { violations } = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()
          expect(
            violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
            path,
          ).toEqual([])
        }
      })
    })
  }
})

test.describe('without JavaScript @nojs', () => {
  test('pages, search, reactions, Markdown, contact links, and 404s work without scripts @nojs', async ({
    page,
  }) => {
    await page.goto('/the-moons-of-2023')
    await expect(page.getByRole('heading', { level: 1, name: 'The Moons of 2023' })).toBeVisible()
    await expect(page.locator('.prose img').first()).toBeVisible()
    const markdown = page.getByRole('link', { name: 'View as Markdown' }).first()
    await expect(markdown).toHaveAttribute('href', '/the-moons-of-2023.md')
    await expect(page.getByRole('button', { name: 'Copy as Markdown' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Share' }).first().click()
    const share = page.getByRole('list', { name: 'Share this post' }).first()
    await expect(share.getByRole('link', { name: 'Reddit' })).toBeVisible()
    await expect(share.getByRole('button', { name: 'Copy link' })).toHaveCount(0)

    await page.goto('/')
    await expect(page.getByRole('button', { name: /^Scroll / })).toHaveCount(0)
    await page.getByRole('searchbox', { name: 'Search posts' }).first().fill('hdr')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=hdr/)
    await expect(page.getByRole('link', { name: /gain maps/i })).toBeVisible()

    await page.goto('/how-gain-maps-elevate-hdr-photography')
    const laugh = page.getByRole('button', { name: /^Laugh/ })
    await laugh.click()
    await expect(laugh).toHaveAttribute('aria-pressed', 'true')
    await expect(laugh).toHaveAccessibleName(/^Laugh, \d/)

    await page.goto('/contact')
    await expect(page.getByRole('link', { name: 'greg@gregrickaby.com' })).toHaveAttribute(
      'href',
      'mailto:greg@gregrickaby.com',
    )

    for (const path of ['/no-such-post', '/tag/zzz-none']) {
      const missing = await page.goto(path)
      expect(missing?.status()).toBe(404)
      await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()
      await expect(page.getByRole('main')).toHaveCount(1)
      await expect(page.getByRole('banner')).toHaveCount(1)
    }
  })
})

test.describe('phones @mobile', () => {
  test('the menu opens as a popover and closes after navigating @mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Main' }).first()).toBeHidden()
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    const menu = page.locator('#site-menu')
    await expect(menu).toBeVisible()
    await menu.getByRole('link', { name: 'Photos' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Photos' })).toBeVisible()
    await expect(menu).toBeHidden()
  })

  test('the page never scrolls sideways @mobile', async ({ page }) => {
    for (const path of [
      '/',
      '/blog',
      '/the-moons-of-2023',
      '/photos',
      '/gear',
      '/resume',
      '/contact',
    ]) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
})
