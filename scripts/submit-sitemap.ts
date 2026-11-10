/**
 * Asks Google Search Console to fetch sitemap.xml again. Runs as Coolify's
 * post-deployment command, after indexnow. Skips when
 * GSC_SERVICE_ACCOUNT_JSON is unset, so local runs and forks stay quiet.
 */
import { createSign } from 'node:crypto'

const PROPERTY = 'sc-domain:gregrickaby.com'
const SITEMAP = 'https://gregrickaby.com/sitemap.xml'
const SCOPE = 'https://www.googleapis.com/auth/webmasters'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const WEBMASTERS_API = 'https://www.googleapis.com/webmasters/v3'

interface ServiceAccountKey {
  client_email: string
  private_key: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseKey(json: string): ServiceAccountKey {
  let key: unknown
  try {
    key = JSON.parse(json)
  } catch {
    // A parse error can echo part of its input, and the input is the private key.
    throw new Error('GSC_SERVICE_ACCOUNT_JSON is not valid JSON')
  }
  if (
    !isRecord(key) ||
    typeof key.client_email !== 'string' ||
    typeof key.private_key !== 'string'
  ) {
    throw new Error('GSC_SERVICE_ACCOUNT_JSON has no client_email or private_key')
  }
  return { client_email: key.client_email, private_key: key.private_key }
}

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function buildAssertion(key: ServiceAccountKey): string {
  const issued = Math.floor(Date.now() / 1000)
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: key.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: issued,
    exp: issued + 3600,
  })}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url')
  return `${unsigned}.${signature}`
}

async function getAccessToken(key: ServiceAccountKey): Promise<string> {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: buildAssertion(key),
    }),
  })
  const body: unknown = await response.json()
  if (!response.ok || !isRecord(body) || typeof body.access_token !== 'string') {
    throw new Error(`Google sign-in failed: ${response.status} ${JSON.stringify(body)}`)
  }
  return body.access_token
}

const json = process.env.GSC_SERVICE_ACCOUNT_JSON
if (!json) {
  console.log('Skipping sitemap submit: GSC_SERVICE_ACCOUNT_JSON is not set')
  process.exit(0)
}

const token = await getAccessToken(parseKey(json))
const response = await fetch(
  `${WEBMASTERS_API}/sites/${encodeURIComponent(PROPERTY)}/sitemaps/${encodeURIComponent(SITEMAP)}`,
  { method: 'PUT', headers: { Authorization: `Bearer ${token}` } },
)

if (!response.ok) {
  console.error(`Sitemap submit failed: ${response.status} ${await response.text()}`)
  process.exit(1)
}

console.log(`Asked Google to fetch ${SITEMAP} (HTTP ${response.status})`)
