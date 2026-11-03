/**
 * Checks the site-wide settings search engines depend on: one-hop redirects
 * from http and www, a real 404 for a missing page, security and compression
 * headers, robots.txt (sitemap, Content-Signal, no search or AI agent shut
 * out), search and AI crawlers reaching the site through Cloudflare, every
 * Markdown copy llms.txt lists, and every fixed redirect in lib/redirects.ts
 * landing on a live page in one hop. Prints only problems.
 *
 *   node .claude/skills/seo-audit/scripts/site.ts [--base https://gregrickaby.com]
 */
import { parseArgs } from 'node:util'

import { redirects } from '../../../../lib/redirects.ts'

const PERMANENT = new Set([301, 308])
const HEADERS = ['strict-transport-security', 'content-security-policy', 'x-content-type-options']

function head(url: string): Promise<Response> {
  return fetch(url, { method: 'HEAD', redirect: 'manual' })
}

/** Whether `from` redirects permanently, in one hop, to exactly `to`. */
export async function checkHop(from: string, to: string): Promise<string | null> {
  const response = await head(from)
  const location = response.headers.get('location')
  const target = location && new URL(location, from).href
  if (!PERMANENT.has(response.status)) return `${from} answers ${response.status}, not a 301 or 308`
  return target === new URL(to).href ? null : `${from} redirects to ${target}, not ${to}`
}

/** Header and robots problems on the home page, its robots.txt, and llms.txt. */
export async function checkBasics(base: string): Promise<string[]> {
  const problems: string[] = []
  const home = await fetch(base, { headers: { 'accept-encoding': 'br, gzip' } })
  for (const name of HEADERS) if (!home.headers.get(name)) problems.push(`home page sends no ${name}`)
  if (!/br|gzip/.test(home.headers.get('content-encoding') ?? '')) {
    problems.push('home page is not compressed')
  }

  const missing = await head(`${base}/seo-audit-${Date.now()}`)
  if (missing.status !== 404) problems.push(`a missing page answers ${missing.status}, not 404`)

  return problems
}

/** Agents that read `robots.txt` by name for search and AI answers. */
const ROBOTS_AGENTS = [
  'Googlebot',
  'Bingbot',
  'Google-Extended',
  'Applebot-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
]
/** Crawlers whose requests Cloudflare's bot rules could block at the edge. */
const CRAWLERS: Record<string, string> = {
  Googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  Bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  GPTBot: 'Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)',
  'OAI-SearchBot': 'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
  ClaudeBot: 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
  PerplexityBot: 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
}

/** The agents a `robots.txt` shuts out of the whole site, by name or through `*`. */
export function getBlockedAgents(rules: string): string[] {
  const groups: { agents: string[]; blocked: boolean }[] = []
  let readingAgents = false
  for (const line of rules.split('\n')) {
    const [field = '', ...rest] = line.replace(/#.*/, '').split(':')
    const key = field.trim().toLowerCase()
    const value = rest.join(':').trim()
    if (!key) continue
    // Consecutive User-Agent lines share the rules that follow them.
    if (key === 'user-agent') {
      if (!readingAgents) groups.push({ agents: [], blocked: false })
      groups.at(-1)?.agents.push(value.toLowerCase())
    } else if (key === 'disallow' && value === '/' && groups.length) {
      ;(groups.at(-1) as { blocked: boolean }).blocked = true
    }
    readingAgents = key === 'user-agent'
  }
  const blocked = (agent: string) =>
    (groups.find((group) => group.agents.includes(agent.toLowerCase())) ??
      groups.find((group) => group.agents.includes('*')))?.blocked ?? false
  return ROBOTS_AGENTS.filter(blocked)
}

/** robots.txt problems: missing, no sitemap, no content signal, or a search or AI agent shut out. */
export async function checkRobots(base: string): Promise<string[]> {
  const robots = await fetch(`${base}/robots.txt`)
  if (!robots.ok) return [`robots.txt answers ${robots.status}`]
  const rules = await robots.text()
  const problems: string[] = []
  if (!/^sitemap:/im.test(rules)) problems.push('robots.txt does not name the sitemap')
  if (!/^content-signal:/im.test(rules)) problems.push('robots.txt states no Content-Signal')
  const blocked = getBlockedAgents(rules)
  if (blocked.length) problems.push(`robots.txt blocks ${blocked.join(', ')}`)
  return problems
}

/** Crawlers the edge turns away, which robots.txt can't show. */
export async function checkCrawlers(url: string): Promise<string[]> {
  const problems: string[] = []
  for (const [name, agent] of Object.entries(CRAWLERS)) {
    const response = await fetch(url, { method: 'HEAD', headers: { 'user-agent': agent } })
    if (response.status !== 200) problems.push(`${name} gets ${response.status} from ${url}`)
  }
  return problems
}

/** llms.txt problems: missing, or a Markdown copy it lists that doesn't load as Markdown. */
export async function checkLlms(base: string): Promise<string[]> {
  const llms = await fetch(`${base}/llms.txt`)
  if (!llms.ok) return [`llms.txt answers ${llms.status}`]
  const links = [...(await llms.text()).matchAll(/\]\((\S+\.md)\)/g)].map((match) => match[1] as string)
  const problems: string[] = []
  for (const link of links) {
    const response = await head(link)
    const type = response.headers.get('content-type') ?? ''
    if (response.status !== 200 || !type.startsWith('text/markdown')) {
      problems.push(`llms.txt lists ${link}, which answers ${response.status} ${type}`)
    }
  }
  return problems
}

/** Fixed redirects (no `:param`) that miss their destination, chain, or land on an error. */
export async function checkRedirects(
  base: string,
  rules: { source: string; destination: string }[],
): Promise<string[]> {
  const problems: string[] = []
  for (const { source, destination } of rules) {
    if (source.includes(':')) continue
    const hop = await checkHop(`${base}${source}`, new URL(destination, base).href)
    if (hop) {
      problems.push(hop)
      continue
    }
    const landing = await head(new URL(destination, base).href)
    if (landing.status !== 200) {
      problems.push(`${source} lands on ${destination}, which answers ${landing.status}`)
    }
  }
  return problems
}

async function main() {
  const { values } = parseArgs({
    options: { base: { type: 'string', default: 'https://gregrickaby.com' } },
  })
  const base = values.base
  const { host } = new URL(base)
  const problems = [
    await checkHop(`http://${host}/blog`, `${base}/blog`),
    await checkHop(`https://www.${host}/blog`, `${base}/blog`),
    ...(await checkBasics(base)),
    ...(await checkRobots(base)),
    ...(await checkCrawlers(base)),
    ...(await checkLlms(base)),
    ...(await checkRedirects(base, redirects)),
  ].filter((problem): problem is string => problem !== null)

  const fixed = redirects.filter((rule) => !rule.source.includes(':')).length
  console.log(`Site checks, ${fixed} fixed redirects followed: ${problems.length} problems\n`)
  for (const problem of problems) console.log(problem)
}

if (import.meta.main) await main()
