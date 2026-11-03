/**
 * Google Search Console for the seo-audit skill. It signs in as a service
 * account with node:crypto and calls the REST API with fetch, so it needs no
 * packages. Run it from the repo root; SKILL.md lists the commands.
 *
 *   node --env-file-if-exists=.env.local .claude/skills/seo-audit/scripts/search-console.ts <command>
 */
import { createSign } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'

export const READ_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
export const WRITE_SCOPE = 'https://www.googleapis.com/auth/webmasters'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const WEBMASTERS_API = 'https://www.googleapis.com/webmasters/v3'
const INSPECT_URL = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect'

export interface ServiceAccountKey {
  client_email: string
  private_key: string
}

export interface PerformanceRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface PerformanceOptions {
  startDate: string
  endDate: string
  dimensions: string[]
  limit: number
  page?: string
}

export interface Site {
  siteUrl: string
  permissionLevel: string
}

export interface Sitemap {
  path: string
  lastSubmitted?: string
  lastDownloaded?: string
  isPending?: boolean
  errors?: string
  warnings?: string
  contents?: { type: string; submitted?: string }[]
}

export interface IndexStatus {
  verdict?: string
  coverageState?: string
  indexingState?: string
  robotsTxtState?: string
  pageFetchState?: string
  lastCrawlTime?: string
  googleCanonical?: string
  userCanonical?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Reads the JSON key file Google gives a service account, keeping the two fields signing needs. */
export function parseKey(json: string): ServiceAccountKey {
  const key: unknown = JSON.parse(json)
  if (
    !isRecord(key) ||
    typeof key.client_email !== 'string' ||
    typeof key.private_key !== 'string'
  ) {
    throw new Error('The key file has no client_email or private_key. Is it a service account key?')
  }
  return { client_email: key.client_email, private_key: key.private_key }
}

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

/** A signed JWT that Google trades for an access token, good for one hour. */
export function buildAssertion(key: ServiceAccountKey, scope: string, now = Date.now()): string {
  const issued = Math.floor(now / 1000)
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: key.client_email,
    scope,
    aud: TOKEN_URL,
    iat: issued,
    exp: issued + 3600,
  })}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url')
  return `${unsigned}.${signature}`
}

/** Calls a Google API and returns its JSON, or throws with Google's own error message. */
async function request(url: string, init: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(url, init)
  const text = await response.text()
  const parsed: unknown = text ? JSON.parse(text) : {}
  const body = isRecord(parsed) ? parsed : {}
  if (!response.ok) {
    const { error } = body
    const detail =
      (isRecord(error) && typeof error.message === 'string' && error.message) ||
      (typeof body.error_description === 'string' && body.error_description) ||
      text
    throw new Error(`${response.status} from ${new URL(url).pathname}: ${detail}`)
  }
  return body
}

export async function getAccessToken(key: ServiceAccountKey, scope: string): Promise<string> {
  const body = await request(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: buildAssertion(key, scope),
    }),
  })
  if (typeof body.access_token !== 'string') {
    throw new Error('Google sent no access token')
  }
  return body.access_token
}

function authorized(token: string, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  }
}

function getSiteApi(site: string): string {
  return `${WEBMASTERS_API}/sites/${encodeURIComponent(site)}`
}

/** The properties the service account was added to, with its permission on each. */
export async function listSites(token: string): Promise<Site[]> {
  const body = await request(`${WEBMASTERS_API}/sites`, authorized(token))
  return Array.isArray(body.siteEntry) ? (body.siteEntry as Site[]) : []
}

/** Clicks, impressions, CTR, and average position, grouped by the dimensions in order. */
export async function queryPerformance(
  token: string,
  site: string,
  options: PerformanceOptions,
): Promise<PerformanceRow[]> {
  const body = await request(
    `${getSiteApi(site)}/searchAnalytics/query`,
    authorized(token, {
      method: 'POST',
      body: JSON.stringify({
        startDate: options.startDate,
        endDate: options.endDate,
        dimensions: options.dimensions,
        rowLimit: options.limit,
        ...(options.page && {
          dimensionFilterGroups: [
            { filters: [{ dimension: 'page', operator: 'contains', expression: options.page }] },
          ],
        }),
      }),
    }),
  )
  return Array.isArray(body.rows) ? (body.rows as PerformanceRow[]) : []
}

export async function listSitemaps(token: string, site: string): Promise<Sitemap[]> {
  const body = await request(`${getSiteApi(site)}/sitemaps`, authorized(token))
  return Array.isArray(body.sitemap) ? (body.sitemap as Sitemap[]) : []
}

/** Asks Google to fetch a sitemap again. Needs WRITE_SCOPE and a Full user on the property. */
export async function submitSitemap(token: string, site: string, sitemap: string): Promise<void> {
  await request(
    `${getSiteApi(site)}/sitemaps/${encodeURIComponent(sitemap)}`,
    authorized(token, { method: 'PUT' }),
  )
}

/** How Google last saw one URL: indexed or not, why, and which canonical it chose. */
export async function inspectUrl(token: string, site: string, url: string): Promise<IndexStatus> {
  const body = await request(
    INSPECT_URL,
    authorized(token, {
      method: 'POST',
      body: JSON.stringify({ inspectionUrl: url, siteUrl: site }),
    }),
  )
  const result = body.inspectionResult
  return isRecord(result) && isRecord(result.indexStatusResult)
    ? (result.indexStatusResult as IndexStatus)
    : {}
}

/** Whether Google picked a different canonical than the page names. A trailing slash isn't a difference. */
export function hasCanonicalMismatch(status: IndexStatus): boolean {
  const trim = (url: string) => url.replace(/\/$/, '')
  return Boolean(
    status.googleCanonical && trim(status.googleCanonical) !== trim(status.userCanonical ?? ''),
  )
}

export function getSitemapUrls(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] as string)
}

/** The last `days` days through today, as the API's YYYY-MM-DD dates. */
export function getDateRange(
  days: number,
  today = new Date(),
): { startDate: string; endDate: string } {
  const start = new Date(today)
  start.setUTCDate(start.getUTCDate() - days)
  return { startDate: start.toISOString().slice(0, 10), endDate: today.toISOString().slice(0, 10) }
}

/** Lines up rows of cells in columns, with the header first. */
export function formatTable(header: string[], rows: string[][]): string {
  const widths = header.map((cell, column) =>
    Math.max(cell.length, ...rows.map((row) => (row[column] ?? '').length)),
  )
  return [header, ...rows]
    .map((row) =>
      row
        .map((cell, column) => cell.padEnd(widths[column] ?? 0))
        .join('  ')
        .trimEnd(),
    )
    .join('\n')
}

/**
 * A rough click-through rate for each of the top 10 positions, from public
 * studies of organic results. Real rates swing with the query and the page's
 * features, so treat a gap as a lead, not a verdict.
 */
const EXPECTED_CTR = [0.28, 0.15, 0.11, 0.08, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02]

/** Fewer impressions than these is noise on a site this size. */
const PAGE_MIN_IMPRESSIONS = 20
const QUERY_MIN_IMPRESSIONS = 5

/** Words too common to count as a missing search term. */
const STOP_WORDS = new Set([
  'and',
  'are',
  'can',
  'does',
  'for',
  'from',
  'how',
  'into',
  'the',
  'what',
  'with',
  'you',
  'your',
])

export function getExpectedCtr(position: number): number {
  return EXPECTED_CTR[Math.round(position) - 1] ?? 0.01
}

export interface PageText {
  title: string
  /** The title, description, and headings, lowercased, for matching search terms. */
  text: string
}

interface ContentEntry {
  meta: { slug: string; title: string; description?: string }
  headings?: { text: string }[]
}

/** Each post and page's words by URL path, from `.generated/content.json`. */
export function getPageText(entries: ContentEntry[]): Map<string, PageText> {
  return new Map(
    entries.map(({ meta, headings = [] }) => [
      `/${meta.slug}`,
      {
        title: meta.title,
        text: [meta.title, meta.description, ...headings.map((h) => h.text)]
          .join(' ')
          .toLowerCase(),
      },
    ]),
  )
}

export interface Opportunities {
  /** Pages on the first page of results that get far fewer clicks than their position should. */
  lowCtr: {
    page: string
    title?: string
    impressions: number
    clicks: number
    ctr: number
    expected: number
    position: number
  }[]
  /** Queries a page ranks 8 to 20 for, where a better answer could reach the top results. */
  strikingDistance: { page: string; query: string; impressions: number; position: number }[]
  /** Searched words that a page's title, description, and headings never use. */
  missingTerms: { page: string; query: string; impressions: number; missing: string[] }[]
}

function getPath(url: string): string {
  return new URL(url).pathname.replace(/(.)\/$/, '$1')
}

/**
 * Finds what to rewrite or expand.
 * @param pages rows by `page`
 * @param queries rows by `page` then `query`
 * @param origin the site's origin, such as `https://gregrickaby.com`; other hosts are skipped
 */
export function findOpportunities(
  pages: PerformanceRow[],
  queries: PerformanceRow[],
  text: Map<string, PageText>,
  origin: string,
  limit = 10,
): Opportunities {
  // A domain property also reports subdomains, and rows for jump links
  // (`#heading`) repeat their page's numbers.
  const isPage = (url: string) => url.startsWith(`${origin}/`) && !url.includes('#')

  const lowCtr = pages
    .filter((row) => isPage(row.keys[0] ?? '#'))
    .map((row) => {
      const page = row.keys[0] as string
      const { impressions, clicks, ctr, position } = row
      return {
        page,
        title: text.get(getPath(page))?.title,
        impressions,
        clicks,
        ctr,
        position,
        expected: getExpectedCtr(position),
      }
    })
    .filter(
      (row) =>
        row.impressions >= PAGE_MIN_IMPRESSIONS && row.position <= 10 && row.ctr < row.expected / 2,
    )
    .sort((a, b) => b.impressions * (b.expected - b.ctr) - a.impressions * (a.expected - a.ctr))
    .slice(0, limit)

  const ranked = queries
    .filter((row) => isPage(row.keys[0] ?? '#') && row.impressions >= QUERY_MIN_IMPRESSIONS)
    .map((row) => ({
      page: row.keys[0] as string,
      query: row.keys[1] ?? '',
      impressions: row.impressions,
      position: row.position,
    }))
    .sort((a, b) => b.impressions - a.impressions)

  const strikingDistance = ranked
    .filter((row) => row.position >= 8 && row.position <= 20)
    .slice(0, limit)

  const missingTerms = ranked
    .flatMap((row) => {
      const words = text.get(getPath(row.page))?.text
      if (words === undefined) return []
      const missing = row.query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word) && !words.includes(word))
      return missing.length ? [{ ...row, missing }] : []
    })
    .map(({ page, query, impressions, missing }) => ({ page, query, impressions, missing }))
    .slice(0, limit)

  return { lowCtr, strikingDistance, missingTerms }
}

const SITEMAP = 'https://gregrickaby.com/sitemap.xml'

async function main() {
  const keyFile = process.env.GSC_KEY_FILE
  const site = process.env.GSC_SITE || 'sc-domain:gregrickaby.com'

  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      by: { type: 'string', default: 'query' },
      days: { type: 'string', default: '28' },
      limit: { type: 'string', default: '25' },
      page: { type: 'string' },
      sitemap: { type: 'boolean', default: false },
    },
  })
  const [command, ...args] = positionals

  if (!keyFile) {
    console.error('Set GSC_KEY_FILE in .env.local to the service account JSON key file (see SKILL.md).')
    process.exit(1)
  }

  const key = parseKey(readFileSync(keyFile, 'utf-8'))
  const token = await getAccessToken(key, command === 'submit-sitemap' ? WRITE_SCOPE : READ_SCOPE)

  switch (command) {
    case 'sites': {
      const sites = await listSites(token)
      console.log(
        formatTable(
          ['Property', 'Permission'],
          sites.map((entry) => [entry.siteUrl, entry.permissionLevel]),
        ),
      )
      break
    }

    case 'performance': {
      const range = getDateRange(Number(values.days))
      const rows = await queryPerformance(token, site, {
        ...range,
        dimensions: values.by.split(','),
        limit: Number(values.limit),
        page: values.page,
      })
      console.log(`${site}, ${range.startDate} to ${range.endDate}, by ${values.by}\n`)
      console.log(
        formatTable(
          [values.by, 'Clicks', 'Impressions', 'CTR', 'Position'],
          rows.map((row) => [
            row.keys.join(' '),
            String(row.clicks),
            String(row.impressions),
            `${(row.ctr * 100).toFixed(1)}%`,
            row.position.toFixed(1),
          ]),
        ),
      )
      break
    }

    case 'opportunities': {
      const range = getDateRange(Number(values.days))
      const content = JSON.parse(readFileSync('.generated/content.json', 'utf-8')) as {
        posts: Parameters<typeof getPageText>[0]
        pages: Parameters<typeof getPageText>[0]
      }
      const [pages, queries] = await Promise.all([
        queryPerformance(token, site, { ...range, dimensions: ['page'], limit: 1000 }),
        queryPerformance(token, site, { ...range, dimensions: ['page', 'query'], limit: 5000 }),
      ])
      const found = findOpportunities(
        pages,
        queries,
        getPageText([...content.posts, ...content.pages]),
        new URL(SITEMAP).origin,
      )
      const percent = (value: number) => `${(value * 100).toFixed(1)}%`

      console.log(`${site}, ${range.startDate} to ${range.endDate}\n`)
      console.log('Low click-through for the position (rewrite the title and description):\n')
      console.log(
        formatTable(
          ['Page', 'Title', 'Impressions', 'Clicks', 'CTR', 'Expected', 'Position'],
          found.lowCtr.map((row) => [
            row.page,
            row.title ?? '',
            String(row.impressions),
            String(row.clicks),
            percent(row.ctr),
            percent(row.expected),
            row.position.toFixed(1),
          ]),
        ),
      )
      console.log('\nStriking distance, positions 8 to 20 (answer the query better):\n')
      console.log(
        formatTable(
          ['Page', 'Query', 'Impressions', 'Position'],
          found.strikingDistance.map((row) => [
            row.page,
            row.query,
            String(row.impressions),
            row.position.toFixed(1),
          ]),
        ),
      )
      console.log('\nSearched words the title, description, and headings never use:\n')
      console.log(
        formatTable(
          ['Page', 'Query', 'Impressions', 'Missing'],
          found.missingTerms.map((row) => [
            row.page,
            row.query,
            String(row.impressions),
            row.missing.join(' '),
          ]),
        ),
      )
      break
    }

    case 'inspect': {
      const urls = values.sitemap ? getSitemapUrls(await (await fetch(SITEMAP)).text()) : args
      for (const url of urls) {
        const status = await inspectUrl(token, site, url)
        const canonical = hasCanonicalMismatch(status)
          ? `, Google chose ${status.googleCanonical} over ${status.userCanonical ?? 'none'}`
          : ''
        console.log(
          `${status.verdict ?? '?'}  ${url}  ${status.coverageState ?? 'no data'}, crawled ${status.lastCrawlTime ?? 'never'}${canonical}`,
        )
      }
      break
    }

    case 'sitemaps': {
      const sitemaps = await listSitemaps(token, site)
      console.log(
        formatTable(
          ['Sitemap', 'Submitted', 'Downloaded', 'URLs', 'Errors', 'Warnings', 'Pending'],
          sitemaps.map((entry) => [
            entry.path,
            entry.lastSubmitted ?? '',
            entry.lastDownloaded ?? '',
            entry.contents?.map((content) => content.submitted ?? '0').join('/') ?? '',
            entry.errors ?? '0',
            entry.warnings ?? '0',
            entry.isPending ? 'yes' : 'no',
          ]),
        ),
      )
      break
    }

    case 'submit-sitemap': {
      const url = args[0] ?? SITEMAP
      await submitSitemap(token, site, url)
      console.log(`Submitted ${url}`)
      break
    }

    default:
      console.error('Commands: sites, performance, opportunities, inspect, sitemaps, submit-sitemap')
      process.exit(1)
  }
}

if (import.meta.main) await main()
