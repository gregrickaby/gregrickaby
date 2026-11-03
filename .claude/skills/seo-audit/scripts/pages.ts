/**
 * Checks every URL in the live sitemap: status, HTML basics (doctype, charset,
 * viewport, lang, one title and description), title and description length, a
 * self-referencing canonical, noindex, one h1, URL form, images (alt text,
 * dimensions, a lazy first image), vague link text, accessibility a static read
 * can find, share cards, JSON-LD and the fields Google needs for an article,
 * the author and dates behind it, a Markdown copy for AI agents, and thin
 * posts. Then it checks each share image loads, follows every internal link
 * for 404s and redirects, and lists pages no other page links to. Prints only
 * what needs attention. `site.ts` checks the site-wide settings.
 *
 *   node .claude/skills/seo-audit/scripts/pages.ts [--base https://gregrickaby.com]
 */
import { parseArgs } from 'node:util'

/** Google cuts titles at about 600 pixels, near 60 characters. */
const TITLE_MAX = 60
const DESCRIPTION_MIN = 50
const DESCRIPTION_MAX = 160
const SOCIAL_TAGS = ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']
/** Fewer words than this in a post's main content is thin for Google. Archives are lists, so they're skipped. */
const THIN_WORDS = 300
/** Link text that tells readers and Google nothing about the page it points to. */
const VAGUE_LINK_TEXT = /^(here|click here|read more|more|this|link|this link)$/i
/** Fields Google's article rich results need, plus `dateModified`, which shows readers and AI answers the post is current. */
const ARTICLE_FIELDS = ['headline', 'image', 'datePublished', 'dateModified', 'author']
/** Alt text past this is read aloud in full, and belongs in a caption. */
const ALT_MAX = 125
/** Alt text that is a file name, or says only that an image is there. */
const VAGUE_ALT = /^(image|photo|picture|blog post|img|\S+\.(jpe?g|png|webp|avif|gif))$|^(dsc|img)[_-]?\d/i
/** Share cards smaller than this show as a thumbnail, not a large image. */
const CARD_WIDTH = 1200
/** A post not updated in this many years reads as stale to readers, and to Google on fast-moving topics. */
const STALE_YEARS = 3

export interface PageAudit {
  title?: string
  description?: string
  /** The share card image, checked once per URL by `checkImages`. */
  image?: string
  issues: string[]
  /** Same-origin links, without fragments. */
  links: string[]
}

/** The text between the first `open` and the next `close`, or undefined. */
function getBetween(html: string, open: string, close: string): string | undefined {
  const start = html.indexOf(open)
  if (start === -1) return undefined
  const end = html.indexOf(close, start + open.length)
  return end === -1 ? undefined : html.slice(start + open.length, end).trim()
}

function getTags(html: string, name: string): string[] {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((match) => match[0])
}

const ENTITIES: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }

/** Decodes the entities React writes in attributes, such as `&#x27;` in a file name. */
export function decodeEntities(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (entity, code: string) => {
    if (code.startsWith('#x')) return String.fromCodePoint(parseInt(code.slice(2), 16))
    if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)))
    return ENTITIES[code] ?? entity
  })
}

function getAttribute(tag: string, name: string): string | undefined {
  const value = tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1]
  return value === undefined ? undefined : decodeEntities(value)
}

function getMeta(html: string, key: string): string | undefined {
  const tag = getTags(html, 'meta').find(
    (meta) => getAttribute(meta, 'name') === key || getAttribute(meta, 'property') === key,
  )
  return tag && getAttribute(tag, 'content')
}

type SchemaNode = Record<string, unknown>

/** Each JSON-LD node on the page, or `invalid` for a block that doesn't parse. */
export function getSchemaNodes(html: string): (SchemaNode | 'invalid')[] {
  const open = '<script type="application/ld+json">'
  return html
    .split(open)
    .slice(1)
    .flatMap((block): (SchemaNode | 'invalid')[] => {
      try {
        const data = JSON.parse(block.slice(0, block.indexOf('</script'))) as SchemaNode
        return Array.isArray(data['@graph']) ? (data['@graph'] as SchemaNode[]) : [data]
      } catch {
        return ['invalid']
      }
    })
}

/** Text with its tags dropped. */
function stripTags(html: string): string {
  return html
    .split('<')
    .map((part) => part.slice(part.indexOf('>') + 1))
    .join('')
    .trim()
}

/** Each `<name>` element's opening tag and inner HTML. Not for elements that nest in themselves. */
function getElements(html: string, name: string): { tag: string; inner: string }[] {
  return [...html.matchAll(new RegExp(`(<${name}\\b[^>]*>)([\\s\\S]*?)</${name}>`, 'gi'))].map(
    (match) => ({ tag: match[1] as string, inner: match[2] as string }),
  )
}

/** Whether a link or button has a name a screen reader can announce. */
function hasName({ tag, inner }: { tag: string; inner: string }): boolean {
  if (getAttribute(tag, 'aria-hidden') === 'true') return true
  if (getAttribute(tag, 'aria-label') || getAttribute(tag, 'aria-labelledby')) return true
  return !!stripTags(inner) || getTags(inner, '(img|svg)').some((img) => getAttribute(img, 'alt') || getAttribute(img, 'aria-label'))
}

/** Accessibility problems a static read of the HTML can find. Contrast and focus need a browser. */
export function findA11yIssues(html: string): string[] {
  const issues: string[] = []
  const check = (count: number, problem: string) => count > 0 && issues.push(`${count} ${problem}`)

  const levels = getTags(html, 'h[1-6]').map((tag) => Number(tag[2]))
  const skips = levels.filter((level, i) => i > 0 && level > (levels[i - 1] as number) + 1)
  check(skips.length, 'headings skip a level')
  check(getElements(html, 'h[1-6]').filter(({ inner }) => !stripTags(inner) && !getTags(inner, 'img').length).length, 'empty headings')
  check(getElements(html, 'a').filter((link) => !hasName(link)).length, 'links with no name')
  check(getElements(html, 'button').filter((button) => !hasName(button)).length, 'buttons with no name')

  const labelled = new Set(getTags(html, 'label').map((label) => getAttribute(label, 'for')))
  const fields = getTags(html, '(input|select|textarea)').filter(
    (field) =>
      !/^(hidden|submit|button|reset|image)$/i.test(getAttribute(field, 'type') ?? '') &&
      !getAttribute(field, 'aria-label') &&
      !getAttribute(field, 'aria-labelledby') &&
      !labelled.has(getAttribute(field, 'id')),
  )
  check(fields.length, 'form fields with no label')
  check(getTags(html, 'iframe').filter((frame) => !getAttribute(frame, 'title')).length, 'iframes with no title')

  const ids = getTags(html, '[a-z][a-z0-9-]*').flatMap((tag) => getAttribute(tag, 'id') ?? [])
  const repeated = new Set(ids.filter((id, i) => ids.indexOf(id) !== i))
  check(repeated.size, `ids used twice (${[...repeated].slice(0, 3).join(', ')})`)
  return issues
}

/** Image problems that cost image search, layout stability, or the largest paint. */
function findImageIssues(html: string): string[] {
  const images = getTags(html, 'img')
  const issues: string[] = []
  const check = (count: number, problem: string) => count > 0 && issues.push(`${count} ${problem}`)
  const alts = images.flatMap((img) => getAttribute(img, 'alt') ?? [])

  check(images.length - alts.length, 'images without alt')
  check(alts.filter((alt) => VAGUE_ALT.test(alt.trim())).length, 'images with a file name or "image" for alt')
  check(alts.filter((alt) => alt.length > ALT_MAX).length, `alt texts over ${ALT_MAX} characters`)
  // `fill` images size to their frame, so they shift nothing.
  check(
    images.filter(
      (img) =>
        getAttribute(img, 'data-nimg') !== 'fill' &&
        (!getAttribute(img, 'width') || !getAttribute(img, 'height')),
    ).length,
    'images without width and height',
  )
  const first = getTags(getBetween(html, '<main', '</main>') ?? '', 'img')[0]
  if (first && getAttribute(first, 'loading') === 'lazy') {
    issues.push('the first image in <main> loads lazily, which delays the largest paint')
  }
  return issues
}

/** Share card problems: a small or generic image, and a URL or type that disagrees with the page. */
function findSocialIssues(head: string, canonical: string | undefined, isArticle: boolean): string[] {
  const issues = SOCIAL_TAGS.filter((tag) => !getMeta(head, tag)).map((tag) => `no ${tag}`)
  const alt = getMeta(head, 'og:image:alt')
  const width = Number(getMeta(head, 'og:image:width') ?? CARD_WIDTH)
  const url = getMeta(head, 'og:url')

  if (getMeta(head, 'og:image')) {
    if (!alt) issues.push('no og:image:alt')
    else if (VAGUE_ALT.test(alt) || alt.length < 10) issues.push(`og:image:alt is "${alt}"`)
    if (width < CARD_WIDTH) issues.push(`og:image is ${width} pixels wide, under ${CARD_WIDTH}`)
  }
  if (url && canonical && normalize(new URL(url, canonical)) !== normalize(new URL(canonical))) {
    issues.push(`og:url ${url} differs from the canonical`)
  }
  if (isArticle && getMeta(head, 'og:type') !== 'article') issues.push('og:type is not article')
  return issues
}

/** Who wrote it and when: what Google's E-E-A-T guidance and AI answers look for on an article. */
function findAuthorIssues(nodes: SchemaNode[], article: SchemaNode, main: string, now: Date): string[] {
  const issues: string[] = []
  const byId = (value: unknown): SchemaNode | undefined => {
    const node = value as SchemaNode | undefined
    const id = node?.['@id']
    return (id ? nodes.find((other) => other['@id'] === id) : undefined) ?? node
  }
  const author = byId(article.author)

  if (author) {
    if (!author.name) issues.push('author has no name')
    if (!Array.isArray(author.sameAs) || !author.sameAs.length) issues.push('author has no sameAs profiles')
  }
  if (!getTags(main, 'time').some((time) => getAttribute(time, 'datetime'))) issues.push('no visible date')
  const updated = new Date(String(article.dateModified ?? article.datePublished))
  if (now.getFullYear() - updated.getFullYear() >= STALE_YEARS) {
    issues.push(`not updated since ${updated.getFullYear()}`)
  }
  return issues
}

/** A URL without its fragment or trailing slash, so equal pages compare equal. */
function normalize(url: URL): string {
  return `${url.origin}${url.pathname.replace(/(.)\/$/, '$1')}${url.search}`
}

/** Every same-origin link on the page, resolved against it. */
export function getLinks(html: string, pageUrl: string): string[] {
  const page = new URL(pageUrl)
  const links = getTags(html, 'a').flatMap((tag) => {
    const href = getAttribute(tag, 'href')
    if (!href || href.startsWith('#')) return []
    const url = new URL(href, page)
    return url.origin === page.origin ? [normalize(url)] : []
  })
  return [...new Set(links)]
}

/** Words in the page's <main>, with the tags dropped. */
export function countWords(html: string): number {
  const main = getBetween(html, '<main', '</main>') ?? ''
  const text = main
    .split('<')
    .map((part) => part.slice(part.indexOf('>') + 1))
    .join(' ')
  return text.split(/\s+/).filter((word) => /\w/.test(word)).length
}

export function auditPage(html: string, status: number, pageUrl: string, now = new Date()): PageAudit {
  if (status !== 200) return { issues: [`answers ${status}`], links: [] }

  const head = getBetween(html, '<head', '</head>') ?? ''
  const main = getBetween(html, '<main', '</main>') ?? ''
  const title = getBetween(head, '<title>', '</title>')
  const description = getMeta(head, 'description')
  const headLinks = getTags(head, 'link')
  const canonical = headLinks.find((link) => getAttribute(link, 'rel') === 'canonical')
  const nodes = getSchemaNodes(html)
  const parsed = nodes.filter((node): node is SchemaNode => node !== 'invalid')
  const articles = parsed.filter((node) => ['BlogPosting', 'Article'].includes(String(node['@type'])))
  const { pathname } = new URL(pageUrl)
  const issues: string[] = []
  const check = (problem: string | false) => problem && issues.push(problem)

  check(!/^<!doctype html>/i.test(html.trimStart()) && 'no doctype')
  check(!getTags(head, 'meta').some((meta) => getAttribute(meta, 'charset')) && 'no charset')
  check(!getMeta(head, 'viewport') && 'no viewport')
  check(!getTags(html, 'html').some((tag) => getAttribute(tag, 'lang')) && 'no lang')
  const titles = getTags(head, 'title').length
  check(titles > 1 && `${titles} titles`)
  const descriptions = getTags(head, 'meta').filter((meta) => getAttribute(meta, 'name') === 'description').length
  check(descriptions > 1 && `${descriptions} descriptions`)

  if (!title) issues.push('no title')
  else if (title.length > TITLE_MAX) issues.push(`title is ${title.length} characters`)
  if (!description) issues.push('no description')
  else if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX) {
    issues.push(`description is ${description.length} characters`)
  }
  const href = canonical && getAttribute(canonical, 'href')
  if (!href) issues.push('no canonical')
  else if (normalize(new URL(href, pageUrl)) !== normalize(new URL(pageUrl))) {
    issues.push(`canonical points to ${href}`)
  }
  check(!!getMeta(head, 'robots')?.includes('noindex') && 'noindex, but in the sitemap')
  check(/[A-Z_]/.test(pathname) && 'URL has capitals or underscores')

  const h1s = getTags(html, 'h1').length
  check(h1s !== 1 && `${h1s} h1 headings`)
  issues.push(...findImageIssues(html))
  const vague = getElements(html, 'a').map(({ inner }) => stripTags(inner)).filter((text) => VAGUE_LINK_TEXT.test(text))
  check(vague.length > 0 && `${vague.length} links say only "${vague[0]}"`)
  issues.push(...findA11yIssues(html))

  const canonicalUrl = href ? new URL(href, pageUrl).href : undefined
  issues.push(...findSocialIssues(head, canonicalUrl, articles.length > 0))
  check(!nodes.length && 'no JSON-LD')
  check(nodes.includes('invalid') && 'JSON-LD does not parse')
  for (const article of articles) {
    const missing = ARTICLE_FIELDS.filter((field) => !article[field])
    check(missing.length > 0 && `${String(article['@type'])} has no ${missing.join(', ')}`)
    issues.push(...findAuthorIssues(parsed, article, main, now))
    // AI agents and `llms.txt` read the Markdown copy.
    const markdown = headLinks.some(
      (link) => getAttribute(link, 'rel') === 'alternate' && getAttribute(link, 'type') === 'text/markdown',
    )
    check(!markdown && 'no Markdown alternate')
  }

  const words = countWords(html)
  check(
    pathname !== '/' &&
      !/^\/(tag|category)\//.test(pathname) &&
      words < THIN_WORDS &&
      `thin: ${words} words`,
  )

  return { title, description, image: getMeta(head, 'og:image'), issues, links: getLinks(html, pageUrl) }
}

/** Share card images that don't load as an image, with the pages that use them. */
export async function checkImages(audits: Map<string, PageAudit>): Promise<string[]> {
  const usedBy = new Map<string, string[]>()
  for (const [path, { image }] of audits) if (image) usedBy.set(image, [...(usedBy.get(image) ?? []), path])
  const found: string[] = []
  for (const [image, pages] of usedBy) {
    const response = await fetch(image, { method: 'HEAD' })
    const type = response.headers.get('content-type') ?? ''
    if (!response.ok || !type.startsWith('image/')) {
      found.push(`og:image ${image} answers ${response.status} ${type}, used by ${pages.join(', ')}`)
    }
  }
  return found
}

/** Pages that share a title or a description, which Google reads as duplicates. */
export function findDuplicates(audits: Map<string, PageAudit>): string[] {
  const seen = new Map<string, string[]>()
  for (const [path, { title, description }] of audits) {
    for (const [field, value] of [
      ['title', title],
      ['description', description],
    ] as const) {
      if (value) seen.set(`${field}: ${value}`, [...(seen.get(`${field}: ${value}`) ?? []), path])
    }
  }
  return [...seen]
    .filter(([, paths]) => paths.length > 1)
    .map(([value, paths]) => `${paths.join(', ')} share the ${value}`)
}

/** Sitemap pages no other page links to. Crawlers find them only through the sitemap. */
export function findOrphans(urls: string[], linkedFrom: Map<string, string[]>): string[] {
  return urls.flatMap((url) => {
    const { pathname } = new URL(url)
    const inbound = (linkedFrom.get(normalize(new URL(url))) ?? []).filter((path) => path !== pathname)
    return pathname === '/' || inbound.length ? [] : [pathname]
  })
}

/** Internal links that 404 or redirect, with the pages that link to them. */
export async function checkLinks(
  linkedFrom: Map<string, string[]>,
  known: Set<string>,
): Promise<string[]> {
  const found: string[] = []
  for (const [link, pages] of linkedFrom) {
    if (known.has(link)) continue
    const response = await fetch(link, { method: 'HEAD', redirect: 'manual' })
    const location = response.headers.get('location')
    const from = `linked from ${pages.join(', ')}`
    if (response.status >= 400) found.push(`${link} answers ${response.status}, ${from}`)
    else if (location) found.push(`${link} redirects to ${location}, ${from}`)
  }
  return found
}

async function main() {
  const { values } = parseArgs({
    options: { base: { type: 'string', default: 'https://gregrickaby.com' } },
  })
  const sitemap = await (await fetch(`${values.base}/sitemap.xml`)).text()
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] as string)
  const audits = new Map<string, PageAudit>()
  const linkedFrom = new Map<string, string[]>()

  for (const url of urls) {
    const response = await fetch(url, { redirect: 'manual' })
    const audit = auditPage(await response.text(), response.status, url)
    const path = new URL(url).pathname
    audits.set(path, audit)
    for (const link of audit.links) linkedFrom.set(link, [...(linkedFrom.get(link) ?? []), path])
  }

  const problems = [...audits].filter(([, audit]) => audit.issues.length)
  console.log(`${urls.length} sitemap pages, ${problems.length} with problems\n`)
  for (const [path, audit] of problems) console.log(`${path}: ${audit.issues.join('; ')}`)
  for (const line of findDuplicates(audits)) console.log(line)
  for (const line of await checkImages(audits)) console.log(line)

  const known = new Set(urls.map((url) => normalize(new URL(url))))
  const links = await checkLinks(linkedFrom, known)
  console.log(`\n${linkedFrom.size} internal links, ${links.length} that 404 or redirect`)
  for (const line of links) console.log(line)

  const orphans = findOrphans(urls, linkedFrom)
  if (orphans.length) console.log(`\nNo other page links to ${orphans.join(', ')}`)
}

if (import.meta.main) await main()
