import config from '@/lib/config'
import {MetadataRoute} from 'next'

/**
 * The robots.txt route.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  // List of user agents to block.
  const disallowedUserAgents = [
    'AhrefsBot',
    'Amazonbot',
    'Applebot',
    'Bytespider',
    'CCBot',
    'ChatGPT-User',
    'Claude-Web',
    'ClaudeBot',
    'Diffbot',
    'GPTBot',
    'ImagesiftBot',
    'OAI-SearchBot',
    'Omgili',
    'Omgilibot',
    'PerplexityBot',
    'Pinterestbot',
    'Semrush',
    'SemrushBot',
    'YouBot',
    'anthropic-ai',
    'dotbot'
  ]

  // Create disallow rules for specific user agents.
  const disallowRules = disallowedUserAgents.map((userAgent) => ({
    userAgent,
    disallow: '/'
  }))

  // Rules for the robots.txt.
  const rules = [
    ...disallowRules,
    {
      userAgent: '*',
      allow: '/'
    }
  ]

  // Return the rules and the sitemap URL.
  return {
    rules,
    sitemap: `${config.siteUrl}/sitemap.xml`
  }
}
