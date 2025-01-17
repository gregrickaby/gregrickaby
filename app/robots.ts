import config from '@/lib/config'

/**
 * The robots.txt route.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots() {
  // List of user agents to block.
  const disallowedUserAgents = [
    'CCBot',
    'ChatGPT-User',
    'Claude-Web',
    'GPTBot',
    'Google-Extended',
    'PerplexityBot',
    'anthropic-ai'
  ]

  // Create disallow rules for specific user agents.
  const disallowRules = disallowedUserAgents.map((userAgent) => ({
    userAgent,
    disallow: '/'
  }))

  // Rules for the robots.txt.
  const rules = [
    {
      userAgent: '*',
      allow: '/'
    },
    ...disallowRules
  ]

  // Return the rules and the sitemap URL.
  return {
    rules,
    sitemap: `${config.siteUrl}/sitemap.xml`
  }
}
