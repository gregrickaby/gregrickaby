import assert from 'node:assert/strict'
import { createVerify, generateKeyPairSync } from 'node:crypto'
import { afterEach, describe, it, mock } from 'node:test'

import {
  buildAssertion,
  findOpportunities,
  formatTable,
  getAccessToken,
  getDateRange,
  getExpectedCtr,
  getPageText,
  getSitemapUrls,
  hasCanonicalMismatch,
  inspectUrl,
  listSitemaps,
  listSites,
  parseKey,
  queryPerformance,
  READ_SCOPE,
  submitSitemap,
} from './search-console.ts'

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const KEY = {
  client_email: 'reader@project.iam.gserviceaccount.com',
  private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
}
const SITE = 'sc-domain:gregrickaby.com'
const API = 'https://www.googleapis.com/webmasters/v3/sites'
const realFetch = globalThis.fetch

function decode(part: string): unknown {
  return JSON.parse(Buffer.from(part, 'base64url').toString())
}

/** Answers every fetch with one response and records the requests. */
function respond(status: number, body: unknown) {
  const fetchMock = mock.fn(
    async (_url: string, _init: RequestInit) =>
      new Response(status === 204 ? null : JSON.stringify(body), { status }),
  )
  globalThis.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

function getRequest(fetchMock: ReturnType<typeof respond>, index = 0) {
  const [url, init] = fetchMock.mock.calls[index]?.arguments ?? ['', {}]
  return {
    url,
    init,
    body: typeof init.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined,
  }
}

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('parseKey', () => {
  it('keeps the email and private key from a service account key file', () => {
    const file = JSON.stringify({ ...KEY, type: 'service_account', project_id: 'p' })
    assert.deepEqual(parseKey(file), KEY)
  })

  it('rejects a file that is not a service account key', () => {
    assert.throws(() => parseKey('{"installed":{}}'), /service account key/)
    assert.throws(() => parseKey('null'), /service account key/)
  })
})

describe('buildAssertion', () => {
  it('signs a one-hour token request for the scope with the private key', () => {
    const [header = '', claims = '', signature = ''] = buildAssertion(
      KEY,
      READ_SCOPE,
      1_700_000_000_500,
    ).split('.')

    assert.deepEqual(decode(header), { alg: 'RS256', typ: 'JWT' })
    assert.deepEqual(decode(claims), {
      iss: KEY.client_email,
      scope: READ_SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: 1_700_000_000,
      exp: 1_700_003_600,
    })
    const verify = createVerify('RSA-SHA256').update(`${header}.${claims}`)
    assert.equal(verify.verify(publicKey, signature, 'base64url'), true)
  })
})

describe('getAccessToken', () => {
  it('trades the signed assertion for an access token', async () => {
    const fetchMock = respond(200, { access_token: 'ya29.token', expires_in: 3599 })

    assert.equal(await getAccessToken(KEY, READ_SCOPE), 'ya29.token')
    const { url, init } = getRequest(fetchMock)
    const form = new URLSearchParams(String(init.body))
    assert.equal(url, 'https://oauth2.googleapis.com/token')
    assert.equal(form.get('grant_type'), 'urn:ietf:params:oauth:grant-type:jwt-bearer')
    assert.equal(form.get('assertion')?.split('.').length, 3)
  })

  it('passes on the reason Google refuses the key', async () => {
    respond(400, { error: 'invalid_grant', error_description: 'Invalid JWT Signature.' })

    await assert.rejects(getAccessToken(KEY, READ_SCOPE), {
      message: '400 from /token: Invalid JWT Signature.',
    })
  })

  it('fails when Google answers without a token', async () => {
    respond(200, {})

    await assert.rejects(getAccessToken(KEY, READ_SCOPE), /no access token/)
  })
})

describe('API calls', () => {
  it('lists the properties the account can read', async () => {
    const sites = [{ siteUrl: SITE, permissionLevel: 'siteRestrictedUser' }]
    const fetchMock = respond(200, { siteEntry: sites })

    assert.deepEqual(await listSites('t'), sites)
    const { url, init } = getRequest(fetchMock)
    assert.equal(url, API)
    assert.equal((init.headers as Record<string, string>).Authorization, 'Bearer t')
  })

  it('queries performance by its dimensions, filtered to a page when asked', async () => {
    const rows = [{ keys: ['gamepad api'], clicks: 3, impressions: 90, ctr: 0.033, position: 8.2 }]
    const fetchMock = respond(200, { rows })
    const options = {
      startDate: '2026-10-06',
      endDate: '2026-11-03',
      dimensions: ['query'],
      limit: 5,
    }

    assert.deepEqual(await queryPerformance('t', SITE, { ...options, page: '/gamepad' }), rows)
    await queryPerformance('t', SITE, options)

    const filtered = getRequest(fetchMock, 0)
    assert.equal(filtered.url, `${API}/sc-domain%3Agregrickaby.com/searchAnalytics/query`)
    assert.deepEqual(filtered.body, {
      startDate: '2026-10-06',
      endDate: '2026-11-03',
      dimensions: ['query'],
      rowLimit: 5,
      dimensionFilterGroups: [
        { filters: [{ dimension: 'page', operator: 'contains', expression: '/gamepad' }] },
      ],
    })
    assert.equal('dimensionFilterGroups' in (getRequest(fetchMock, 1).body as object), false)
  })

  it('lists sitemaps and submits one by its URL', async () => {
    const sitemaps = [{ path: 'https://gregrickaby.com/sitemap.xml', errors: '0' }]
    const fetchMock = respond(200, { sitemap: sitemaps })

    assert.deepEqual(await listSitemaps('t', SITE), sitemaps)
    await submitSitemap('t', SITE, 'https://gregrickaby.com/sitemap.xml')

    const submit = getRequest(fetchMock, 1)
    assert.equal(submit.init.method, 'PUT')
    assert.equal(
      submit.url,
      `${API}/sc-domain%3Agregrickaby.com/sitemaps/https%3A%2F%2Fgregrickaby.com%2Fsitemap.xml`,
    )
  })

  it('returns the index status from a URL inspection', async () => {
    const status = { verdict: 'PASS', coverageState: 'Submitted and indexed' }
    const fetchMock = respond(200, { inspectionResult: { indexStatusResult: status } })

    assert.deepEqual(await inspectUrl('t', SITE, 'https://gregrickaby.com/blog'), status)
    assert.deepEqual(getRequest(fetchMock).body, {
      inspectionUrl: 'https://gregrickaby.com/blog',
      siteUrl: SITE,
    })
  })

  it('returns nothing when a response has no results', async () => {
    respond(200, {})

    assert.deepEqual(await listSites('t'), [])
    assert.deepEqual(await listSitemaps('t', SITE), [])
    assert.deepEqual(await inspectUrl('t', SITE, 'https://gregrickaby.com/'), {})
    const options = { startDate: 'a', endDate: 'b', dimensions: ['page'], limit: 1 }
    assert.deepEqual(await queryPerformance('t', SITE, options), [])
  })

  it('reads an empty body as no results', async () => {
    respond(204, null)

    assert.equal(await submitSitemap('t', SITE, 'https://gregrickaby.com/sitemap.xml'), undefined)
  })

  it("throws with Google's message, or the raw body when there isn't one", async () => {
    respond(403, { error: { code: 403, message: 'User does not have sufficient permission' } })
    await assert.rejects(listSites('t'), {
      message: '403 from /webmasters/v3/sites: User does not have sufficient permission',
    })

    respond(500, 'backend error')
    await assert.rejects(listSites('t'), {
      message: '500 from /webmasters/v3/sites: "backend error"',
    })
  })
})

describe('hasCanonicalMismatch', () => {
  it('flags a canonical Google chose over the page', () => {
    const status = {
      googleCanonical: 'https://gregrickaby.com/a',
      userCanonical: 'https://gregrickaby.com/b',
    }
    assert.equal(hasCanonicalMismatch(status), true)
    assert.equal(hasCanonicalMismatch({ googleCanonical: 'https://gregrickaby.com/a' }), true)
  })

  it('ignores a trailing slash, or a page Google has no canonical for', () => {
    const status = {
      googleCanonical: 'https://gregrickaby.com',
      userCanonical: 'https://gregrickaby.com/',
    }
    assert.equal(hasCanonicalMismatch(status), false)
    assert.equal(hasCanonicalMismatch({}), false)
  })
})

describe('helpers', () => {
  it('reads the URLs from a sitemap', () => {
    const xml =
      '<urlset><url><loc>https://gregrickaby.com</loc></url><url><loc>https://gregrickaby.com/blog</loc></url></urlset>'

    assert.deepEqual(getSitemapUrls(xml), [
      'https://gregrickaby.com',
      'https://gregrickaby.com/blog',
    ])
  })

  it('counts back whole days from today in UTC', () => {
    assert.deepEqual(getDateRange(28, new Date('2026-11-03T03:00:00Z')), {
      startDate: '2026-10-06',
      endDate: '2026-11-03',
    })
    assert.match(getDateRange(7).endDate, /^\d{4}-\d{2}-\d{2}$/)
  })

  it('lines up columns to the widest cell', () => {
    const table = formatTable(
      ['Query', 'Clicks'],
      [
        ['gamepad api', '3'],
        ['moon', '12'],
      ],
    )
    assert.equal(table, ['Query        Clicks', 'gamepad api  3', 'moon         12'].join('\n'))
  })

  it('pads a short row and keeps the cells of a long one', () => {
    assert.equal(formatTable(['A', 'B'], [['x'], ['y', 'z', 'extra']]), 'A  B\nx\ny  z  extra')
  })
})

describe('opportunities', () => {
  const ORIGIN = 'https://gregrickaby.com'
  const row = (keys: string[], impressions: number, ctr: number, position: number) => ({
    keys,
    impressions,
    clicks: Math.round(impressions * ctr),
    ctr,
    position,
  })
  const text = getPageText([
    {
      meta: { slug: 'mics', title: 'Microphone shootout', description: 'A Behringer B-1 test' },
      headings: [{ text: 'Frequency response' }],
    },
    { meta: { slug: 'resume', title: 'Resume' } },
  ])

  it('reads each page title and its words by path', () => {
    assert.deepEqual(text.get('/mics'), {
      title: 'Microphone shootout',
      text: 'microphone shootout a behringer b-1 test frequency response',
    })
    assert.equal(text.get('/resume')?.text, 'resume ')
  })

  it('expects fewer clicks lower down the page, and about 1% past the top 10', () => {
    assert.equal(getExpectedCtr(1.2), 0.28)
    assert.equal(getExpectedCtr(8.4), 0.03)
    assert.equal(getExpectedCtr(14), 0.01)
  })

  it('ranks top-10 pages by the clicks they miss, skipping subdomains, jump links, and noise', () => {
    const pages = [
      row([`${ORIGIN}/mics`], 2600, 0.005, 8.3),
      row([`${ORIGIN}/resume`], 50, 0.01, 6),
      row([`${ORIGIN}/fine`], 500, 0.05, 7),
      row([`${ORIGIN}/deep`], 500, 0, 14),
      row([`${ORIGIN}/rare`], 10, 0, 3),
      row([`${ORIGIN}/mics#frequency-response`], 900, 0, 3),
      row(['https://tvratings.gregrickaby.com/tv/1'], 900, 0, 3),
      row([], 900, 0, 3),
    ]

    const { lowCtr } = findOpportunities(pages, [], text, ORIGIN)

    assert.deepEqual(
      lowCtr.map((entry) => [entry.page, entry.title, entry.expected]),
      [
        [`${ORIGIN}/mics`, 'Microphone shootout', 0.03],
        [`${ORIGIN}/resume`, 'Resume', 0.05],
      ],
    )
  })

  it('finds queries ranked 8 to 20 and the searched words a page never uses', () => {
    const queries = [
      row([`${ORIGIN}/mics`, 'behringer b1 review'], 80, 0, 6),
      row([`${ORIGIN}/mics`, 'tlm 103 frequency response'], 116, 0, 9.2),
      row([`${ORIGIN}/mics`, 'behringer b-1 frequency response'], 40, 0, 21),
      row([`${ORIGIN}/mics`, 'how does the b-1 test'], 30, 0, 12),
      row([`${ORIGIN}/unknown`, 'mystery page'], 30, 0, 12),
      row([`${ORIGIN}/mics`, 'rare'], 2, 0, 9),
      row([`${ORIGIN}/mics`], 50, 0, 9),
      row([], 50, 0, 9),
    ]

    const { strikingDistance, missingTerms } = findOpportunities([], queries, text, ORIGIN, 3)

    assert.deepEqual(strikingDistance, [
      { page: `${ORIGIN}/mics`, query: 'tlm 103 frequency response', impressions: 116, position: 9.2 },
      { page: `${ORIGIN}/mics`, query: '', impressions: 50, position: 9 },
      { page: `${ORIGIN}/mics`, query: 'how does the b-1 test', impressions: 30, position: 12 },
    ])
    assert.deepEqual(missingTerms, [
      {
        page: `${ORIGIN}/mics`,
        query: 'tlm 103 frequency response',
        impressions: 116,
        missing: ['tlm', '103'],
      },
      { page: `${ORIGIN}/mics`, query: 'behringer b1 review', impressions: 80, missing: ['review'] },
    ])
  })
})
