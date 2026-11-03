import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'

import {
  auditPage,
  checkImages,
  checkLinks,
  countWords,
  decodeEntities,
  findA11yIssues,
  findDuplicates,
  findOrphans,
  getLinks,
  getSchemaNodes,
} from './pages.ts'

const URL_X = 'https://gregrickaby.com/x'
const SOCIAL = [
  '<meta property="og:title" content="t">',
  '<meta property="og:description" content="d">',
  '<meta property="og:image" content="https://gregrickaby.com/x/card.png">',
  '<meta property="og:image:alt" content="Gamepad API, by Greg Rickaby">',
  '<meta property="og:image:width" content="1200">',
  `<meta property="og:url" content="${URL_X}">`,
  '<meta property="og:type" content="article">',
  '<meta name="twitter:card" content="summary_large_image">',
].join('')
const PERSON = { '@type': 'Person', '@id': '#person', name: 'Greg', sameAs: ['https://github.com/gregrickaby'] }
const ARTICLE = {
  '@type': 'BlogPosting',
  headline: 'h',
  image: 'i',
  datePublished: '2026-10-01',
  dateModified: '2026-10-01',
  author: { '@id': '#person' },
}
const SCHEMA = `<script type="application/ld+json">${JSON.stringify({ '@graph': [ARTICLE, PERSON] })}</script>`
const MARKDOWN = '<link rel="alternate" type="text/markdown" href="https://gregrickaby.com/x.md">'
const NOW = new Date('2026-11-03')
const DESCRIPTION = 'A description long enough for a search result, with a concrete detail in it.'
const WORDS = Array.from({ length: 300 }, () => 'word').join(' ')
const realFetch = globalThis.fetch

const BASICS = '<meta charset="utf-8"><meta name="viewport" content="width=device-width">'

function page(
  head: string,
  body = `<main><h1>Title</h1><time dateTime="2026-10-01">Oct 1</time><img src="a.jpg" alt="A" width="4" height="3"><p>${WORDS}</p></main>`,
) {
  return `<!DOCTYPE html><html lang="en"><head>${BASICS}${head}</head><body>${body}</body></html>`
}

const HEAD = `<title>Gamepad API - Greg Rickaby</title><meta name="description" content="${DESCRIPTION}"><link rel="canonical" href="${URL_X}">${MARKDOWN}${SOCIAL}${SCHEMA}`
const GOOD = page(HEAD)

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('auditPage', () => {
  it('passes a page with every basic in place', () => {
    assert.deepEqual(auditPage(GOOD, 200, URL_X), {
      title: 'Gamepad API - Greg Rickaby',
      description: DESCRIPTION,
      image: 'https://gregrickaby.com/x/card.png',
      issues: [],
      links: [],
    })
  })

  it('reports a page that does not answer 200', () => {
    assert.deepEqual(auditPage('', 308, URL_X), { issues: ['answers 308'], links: [] })
  })

  it('lists each missing or out-of-range basic', () => {
    const bare = page(
      `<title>${'x'.repeat(61)}</title><meta name="description" content="Too short">`,
      '<main><h1>A</h1><h1>B</h1><img src="a.jpg"><img src="b.jpg" alt="" data-nimg="fill"><a href="/x">here</a></main>',
    )

    assert.deepEqual(auditPage(bare, 200, URL_X).issues, [
      'title is 61 characters',
      'description is 9 characters',
      'no canonical',
      '2 h1 headings',
      '1 images without alt',
      '1 images without width and height',
      '1 links say only "here"',
      'no og:title',
      'no og:description',
      'no og:image',
      'no og:url',
      'no twitter:card',
      'no JSON-LD',
      'thin: 3 words',
    ])
    assert.deepEqual(auditPage('<html><head></head></html>', 200, URL_X).issues.slice(0, 8), [
      'no doctype',
      'no charset',
      'no viewport',
      'no lang',
      'no title',
      'no description',
      'no canonical',
      '0 h1 headings',
    ])
  })

  it('flags a canonical that points elsewhere and a noindex page, ignoring a trailing slash', () => {
    const elsewhere = page(
      HEAD.replace(`href="${URL_X}"`, 'href="https://gregrickaby.com/y"') +
        '<meta name="robots" content="noindex, follow">',
    )

    assert.deepEqual(auditPage(elsewhere, 200, URL_X).issues, [
      'canonical points to https://gregrickaby.com/y',
      'noindex, but in the sitemap',
      `og:url ${URL_X} differs from the canonical`,
    ])
    assert.deepEqual(auditPage(GOOD, 200, `${URL_X}/`).issues, [])
  })

  it('flags repeated head tags, URL form, and an article missing what Google needs', () => {
    const repeated = page(
      `${HEAD}<title>Again</title><meta name="description" content="${DESCRIPTION}">`.replace(
        SCHEMA,
        '<script type="application/ld+json">{"@type":"BlogPosting","headline":"h","image":"i"}</script>',
      ),
    )
    const url = 'https://gregrickaby.com/Old_Post'

    assert.deepEqual(auditPage(repeated.replaceAll(URL_X, url), 200, url).issues, [
      '2 titles',
      '2 descriptions',
      'URL has capitals or underscores',
      'BlogPosting has no datePublished, dateModified, author',
    ])
  })

  it('flags image alt text, a lazy first image, and a weak share card', () => {
    const head = HEAD.replace('Gamepad API, by Greg Rickaby', 'Blog post')
      .replace('content="1200"', 'content="600"')
      .replace(`og:url" content="${URL_X}"`, 'og:url" content="https://gregrickaby.com/y"')
      .replace('content="article"', 'content="website"')
    const body = `<main><h1>T</h1><time dateTime="2026-10-01">Oct 1</time><img src="a.jpg" alt="DSC_0042.jpg" width="1" height="1" loading="lazy"><img src="b.jpg" alt="${'x'.repeat(126)}" width="1" height="1"><p>${WORDS}</p></main>`

    assert.deepEqual(auditPage(page(head, body), 200, URL_X, NOW).issues, [
      '1 images with a file name or "image" for alt',
      '1 alt texts over 125 characters',
      'the first image in <main> loads lazily, which delays the largest paint',
      'og:image:alt is "Blog post"',
      'og:image is 600 pixels wide, under 1200',
      'og:url https://gregrickaby.com/y differs from the canonical',
      'og:type is not article',
    ])
    assert.ok(auditPage(page(HEAD.replace(/<meta property="og:image:alt"[^>]*>/, '')), 200, URL_X).issues.includes('no og:image:alt'))
  })

  it("flags an article's missing author details, date, freshness, and Markdown copy", () => {
    const old = { ...ARTICLE, dateModified: '2021-05-01', author: { name: 'Greg' } }
    const head = HEAD.replace(MARKDOWN, '').replace(SCHEMA, `<script type="application/ld+json">${JSON.stringify(old)}</script>`)
    const body = `<main><h1>T</h1><p>${WORDS}</p></main>`

    assert.deepEqual(auditPage(page(head, body), 200, URL_X, NOW).issues, [
      'author has no sameAs profiles',
      'no visible date',
      'not updated since 2021',
      'no Markdown alternate',
    ])
    const nameless = HEAD.replace(SCHEMA, `<script type="application/ld+json">${JSON.stringify({ ...ARTICLE, author: { '@id': '#nobody' } })}</script>`)
    assert.ok(auditPage(page(nameless), 200, URL_X, NOW).issues.includes('author has no name'))
  })

  it('skips the word count on the home page and archives', () => {
    const short = (url: string) =>
      auditPage(
        page(HEAD.replaceAll(URL_X, url), '<main><h1>A</h1><time dateTime="2026-10-01">Oct 1</time></main>'),
        200,
        url,
      ).issues

    assert.deepEqual(short('https://gregrickaby.com/'), [])
    assert.deepEqual(short('https://gregrickaby.com/tag/ai'), [])
    assert.deepEqual(short('https://gregrickaby.com/category/code'), [])
  })

  it('flags JSON-LD that does not parse, and an unclosed title', () => {
    const broken = GOOD.replace(SCHEMA, '<script type="application/ld+json">{oops</script>')

    assert.deepEqual(auditPage(broken, 200, URL_X).issues, ['JSON-LD does not parse'])
    assert.ok(auditPage('<title>Never closed', 200, URL_X).issues.includes('no title'))
  })
})

describe('findA11yIssues', () => {
  it('passes named links and buttons, labelled fields, and headings in order', () => {
    const html = [
      '<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2>',
      '<a href="/">Home</a><a aria-label="Top" href="#top"><svg></svg></a><a href="/p"><img alt="Photo"></a>',
      '<a aria-hidden="true" tabindex="-1" href="/p"><img alt=""></a>',
      '<button aria-label="Like"></button><button>Play</button>',
      '<label for="q">Search</label><input id="q" type="search"><input type="hidden" name="t">',
      '<iframe title="Video" src="/v"></iframe>',
    ].join('')

    assert.deepEqual(findA11yIssues(html), [])
  })

  it('counts each problem', () => {
    const html = [
      '<h1>A</h1><h3>Skipped</h3><h2></h2>',
      '<a href="/"></a><a href="/p"><img alt=""></a><button></button>',
      '<input type="text"><select></select><iframe src="/v"></iframe>',
      '<p id="x"></p><p id="x"></p>',
    ].join('')

    assert.deepEqual(findA11yIssues(html), [
      '1 headings skip a level',
      '1 empty headings',
      '2 links with no name',
      '1 buttons with no name',
      '2 form fields with no label',
      '1 iframes with no title',
      '1 ids used twice (x)',
    ])
  })
})

describe('checkImages', () => {
  it('checks each share image once, and reports ones that are not images', async () => {
    const answers: Record<string, Response> = {
      'https://gregrickaby.com/a.png': new Response(null, { headers: { 'content-type': 'image/png' } }),
      'https://gregrickaby.com/b.png': new Response(null, { status: 200, headers: { 'content-type': 'text/html' } }),
    }
    const fetchMock = mock.fn(async (url: string) => answers[url] ?? new Response(null, { status: 404 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const audits = new Map([
      ['/a', { image: 'https://gregrickaby.com/a.png', issues: [], links: [] }],
      ['/b', { image: 'https://gregrickaby.com/a.png', issues: [], links: [] }],
      ['/c', { image: 'https://gregrickaby.com/b.png', issues: [], links: [] }],
      ['/d', { image: 'https://gregrickaby.com/gone.png', issues: [], links: [] }],
      ['/e', { issues: [], links: [] }],
    ])

    assert.deepEqual(await checkImages(audits), [
      'og:image https://gregrickaby.com/b.png answers 200 text/html, used by /c',
      'og:image https://gregrickaby.com/gone.png answers 404 , used by /d',
    ])
    assert.equal(fetchMock.mock.callCount(), 3)
  })
})

describe('getLinks', () => {
  it('keeps same-origin links once each, without fragments or trailing slashes', () => {
    const html = [
      '<a href="/blog/">Blog</a>',
      '<a href="/blog#top">Top</a>',
      '<a href="post?page=2">Next</a>',
      '<a href="/content/photos/You&#x27;ll.jpg">Photo</a>',
      '<a href="#main">Skip</a>',
      '<a>No href</a>',
      '<a href="https://github.com/gregrickaby">GitHub</a>',
    ].join('')

    assert.deepEqual(getLinks(html, 'https://gregrickaby.com/posts/one'), [
      'https://gregrickaby.com/blog',
      'https://gregrickaby.com/posts/post?page=2',
      "https://gregrickaby.com/content/photos/You'll.jpg",
    ])
  })
})

describe('decodeEntities', () => {
  it('decodes named, decimal, and hex entities, and leaves unknown ones', () => {
    assert.equal(decodeEntities('a&amp;b &#39;c&#x27; &quot;d&quot; &nbsp;'), 'a&b \'c\' "d" &nbsp;')
  })
})

describe('countWords', () => {
  it('counts words in <main> only, without tags or punctuation alone', () => {
    const html = '<nav>Home Blog</nav><main class="x"><h1>Two words</h1><p>and - three <b>more</b></p></main>'

    assert.equal(countWords(html), 5)
    assert.equal(countWords('<p>no main</p>'), 0)
  })
})

describe('getSchemaNodes', () => {
  it('reads a single node and a graph', () => {
    const single = '<script type="application/ld+json">{"@type":"Person"}</script>'

    assert.deepEqual(getSchemaNodes(single + SCHEMA), [
      { '@type': 'Person' },
      ARTICLE,
      PERSON,
    ])
    assert.deepEqual(getSchemaNodes('<p>none</p>'), [])
  })
})

describe('findOrphans', () => {
  it('lists sitemap pages only they themselves link to, never the home page', () => {
    const linkedFrom = new Map([
      ['https://gregrickaby.com/a', ['/']],
      ['https://gregrickaby.com/b', ['/b']],
    ])
    const urls = ['https://gregrickaby.com/', 'https://gregrickaby.com/a', 'https://gregrickaby.com/b', 'https://gregrickaby.com/c']

    assert.deepEqual(findOrphans(urls, linkedFrom), ['/b', '/c'])
  })
})

describe('findDuplicates', () => {
  it('names the pages that share a title or a description', () => {
    const audits = new Map([
      ['/a', { title: 'Same', description: 'One', issues: [], links: [] }],
      ['/b', { title: 'Same', description: 'Two', issues: [], links: [] }],
      ['/c', { issues: ['answers 404'], links: [] }],
    ])

    assert.deepEqual(findDuplicates(audits), ['/a, /b share the title: Same'])
  })
})

describe('checkLinks', () => {
  it('reports links that 404 or redirect, skipping sitemap pages and healthy links', async () => {
    const answers: Record<string, Response> = {
      'https://gregrickaby.com/gone': new Response(null, { status: 404 }),
      'https://gregrickaby.com/old': new Response(null, { status: 308, headers: { location: '/' } }),
      'https://gregrickaby.com/file.jpg': new Response(null, { status: 200 }),
    }
    const fetchMock = mock.fn(async (url: string) => answers[url] as Response)
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const linkedFrom = new Map([
      ['https://gregrickaby.com/gone', ['/a', '/b']],
      ['https://gregrickaby.com/old', ['/a']],
      ['https://gregrickaby.com/file.jpg', ['/a']],
      ['https://gregrickaby.com/blog', ['/a']],
    ])

    assert.deepEqual(await checkLinks(linkedFrom, new Set(['https://gregrickaby.com/blog'])), [
      'https://gregrickaby.com/gone answers 404, linked from /a, /b',
      'https://gregrickaby.com/old redirects to /, linked from /a',
    ])
    assert.equal(fetchMock.mock.callCount(), 3)
  })
})
