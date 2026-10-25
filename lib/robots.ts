import { CONTENT_SIGNAL } from './content-signal'
import { SITE } from './site'

/**
 * The Content Signals Policy (https://contentsignals.org), as comments. Crawlers
 * ignore comments; the `Content-Signal` line in `buildRobotsTxt` is the
 * machine-readable part.
 */
const policy = `# As a condition of accessing this website, you agree to abide by the following content signals:
#
# (a)  If a content-signal = yes, you may collect content for the corresponding use.
# (b)  If a content-signal = no, you may not collect content for the corresponding use.
# (c)  If the website operator does not include a content signal for a corresponding use, the website operator neither grants nor restricts permission via content signal with respect to the corresponding use.
#
# The content signals and their meanings are:
#
# search: building a search index and providing search results (e.g., returning hyperlinks and short excerpts from your website's contents).  Search does not include providing AI-generated search summaries.
# ai-input: inputting content into one or more AI models (e.g., retrieval augmented generation, grounding, or other real-time taking of content for generative AI search answers).
# ai-train: training or fine-tuning AI models.
#
# ANY RESTRICTIONS EXPRESSED VIA CONTENT SIGNALS ARE EXPRESS RESERVATIONS OF RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN UNION DIRECTIVE 2019/790 ON COPYRIGHT AND RELATED RIGHTS IN THE DIGITAL SINGLE MARKET.`

/**
 * Build `/robots.txt`: the Content Signals Policy, a pointer to the Markdown
 * copies for agents, and the crawl rules themselves.
 */
export function buildRobotsTxt(): string {
  return `${policy}

# Index of Markdown copies for agents: ${SITE.url}/llms.txt

User-Agent: *
Content-Signal: ${CONTENT_SIGNAL}
Allow: /
Disallow: /search

Sitemap: ${SITE.url}/sitemap.xml
`
}
