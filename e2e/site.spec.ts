import { instant } from '@next/playwright'
import { expect, test, type Page } from '@playwright/test'

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
    await page.getByRole('button', { name: 'Copy as Markdown' }).click()
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

test.describe('likes', () => {
  test('each like fills the heart a tenth, up to ten, and survives a reload', async ({ page }) => {
    await page.goto('/stable-diffusion-xl-1-0-impresses')
    const like = page.getByRole('button', { name: /Like this post/ })
    await like.click()
    await expect(like).toHaveAccessibleName(/\(1 of 10\)/)
    await expect(like).toContainText(/[1-9]/)
    await page.reload()
    await expect(like).toHaveAccessibleName(/\(1 of 10\)/)
    for (let mine = 2; mine <= 9; mine++) {
      await like.click()
      await expect(like).toHaveAccessibleName(new RegExp(`\\(${mine} of 10\\)`))
    }
    await like.click()
    const full = page.getByRole('button', { name: /You liked this post 10 times/ })
    await expect(full).toBeDisabled()
  })
})

test.describe('table of contents', () => {
  test('links to each section', async ({ page }) => {
    await page.goto('/how-to-install-lamp-on-ubuntu')
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
  })
})

test.describe('without JavaScript @nojs', () => {
  test('pages, search, likes, Markdown, contact links, and 404s work without scripts @nojs', async ({
    page,
  }) => {
    await page.goto('/the-moons-of-2023')
    await expect(page.getByRole('heading', { level: 1, name: 'The Moons of 2023' })).toBeVisible()
    await expect(page.locator('.prose img').first()).toBeVisible()
    const markdown = page.getByRole('link', { name: 'View as Markdown' })
    await expect(markdown).toHaveAttribute('href', '/the-moons-of-2023.md')
    await expect(page.getByRole('button', { name: 'Copy as Markdown' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Copy link' })).toBeHidden()

    await page.goto('/')
    await page.getByRole('searchbox', { name: 'Search posts' }).first().fill('hdr')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=hdr/)
    await expect(page.getByRole('link', { name: /gain maps/i })).toBeVisible()

    await page.goto('/how-gain-maps-elevate-hdr-photography')
    await page.getByRole('button', { name: /Like this post/ }).click()
    await expect(page.getByRole('button', { name: /Like this post again/ })).toContainText(/[1-9]/)

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
    for (const path of ['/', '/blog', '/the-moons-of-2023', '/photos', '/resume', '/contact']) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
})
