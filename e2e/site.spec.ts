import { instant } from '@next/playwright'
import { expect, type Page, test } from '@playwright/test'

/** Fails the test on any Content-Security-Policy violation or uncaught error. */
function watchConsole(page: Page) {
  const problems: string[] = []
  page.on('console', (message) => {
    if (/Content Security Policy/i.test(message.text())) problems.push(message.text())
  })
  page.on('pageerror', (error) => problems.push(error.message))
  return problems
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
    await expect(page.getByRole('heading', { level: 2, name: 'Behind the camera' })).toBeVisible()

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
    await page.getByRole('link', { name: 'Astrophotography', exact: true }).click()
    await expect(
      page.getByRole('heading', { level: 1, name: 'Tag: Astrophotography' }),
    ).toBeVisible()
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

  test('the HDR post keeps its gain-map originals', async ({ page }) => {
    await page.goto('/how-gain-maps-elevate-hdr-photography')
    const hdr = page.locator('.prose img[src$="_HDR_20221205.jpg"]').first()
    await expect(hdr).toHaveAttribute('src', /^\/content\/posts\//)
    const sdr = page.locator('.prose img[src*="_SDR_"]').first()
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
})

test.describe('search, theme, and contact', () => {
  test('header search finds posts', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('searchbox', { name: 'Search posts' }).first().fill('moon')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=moon/)
    await expect(page.getByRole('status')).toContainText('match')
    await expect(page.getByRole('link', { name: 'The Moons of 2023' })).toBeVisible()
  })

  test('the theme choice survives a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await page.getByRole('button', { name: 'Toggle color scheme' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('the contact form reaches its Server Action and reports the result', async ({ page }) => {
    await page.goto('/contact')
    await page.getByLabel('Name').fill('Jane Doe')
    await page.getByLabel('Email').fill('jane@example.com')
    await page.getByLabel('How can I help?').selectOption('consulting')
    await page.getByLabel('Message').fill('Hello')
    await page.getByRole('button', { name: 'Send Message' }).click()
    // No Mailgun credentials in e2e, so the action answers with its failure message.
    await expect(page.locator('main').getByRole('alert')).toHaveText(
      'Failed to send message. Please try again.',
    )
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

    await page.goto('/about')
    await expect(page).toHaveURL(/\/$/)
    const missing = await page.goto('/no-such-post')
    expect(missing?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()
  })
})

test.describe('without JavaScript @nojs', () => {
  test('pages, search, and the contact form work without scripts @nojs', async ({ page }) => {
    await page.goto('/the-moons-of-2023')
    await expect(page.getByRole('heading', { level: 1, name: 'The Moons of 2023' })).toBeVisible()
    await expect(page.locator('.prose img').first()).toBeVisible()

    await page.goto('/')
    await page.getByRole('searchbox', { name: 'Search posts' }).first().fill('hdr')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=hdr/)
    await expect(page.getByRole('link', { name: /Gain Maps/ })).toBeVisible()

    await page.goto('/contact')
    await page.getByLabel('Name').fill('Jane Doe')
    await page.getByLabel('Email').fill('jane@example.com')
    await page.getByLabel('How can I help?').selectOption('other')
    await page.getByLabel('Message').fill('Hello')
    await page.getByRole('button', { name: 'Send Message' }).click()
    await expect(page.locator('main').getByRole('alert')).toHaveText(
      'Failed to send message. Please try again.',
    )
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
    for (const path of ['/', '/blog', '/the-moons-of-2023', '/photos', '/resume', '/contact']) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
})
