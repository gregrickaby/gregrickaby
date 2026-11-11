import { describe, expect, it } from 'vitest'

import { buildRobotsTxt } from '@/lib/robots'

describe('buildRobotsTxt', () => {
  it('allows search and AI answers, and refuses training', () => {
    expect(buildRobotsTxt()).toContain('Content-Signal: search=yes, ai-input=yes, ai-train=no')
  })

  it('starts with the policy definitions as comments', () => {
    const text = buildRobotsTxt()
    expect(text.startsWith('# As a condition of accessing this website')).toBe(true)
    expect(text).toContain('# ai-train: training or fine-tuning AI models.')
    expect(text).toContain('EUROPEAN UNION DIRECTIVE 2019/790')
  })

  it('lets crawlers read every page except search', () => {
    const text = buildRobotsTxt()
    expect(text).toContain('User-Agent: *\nContent-Signal: search=yes, ai-input=yes, ai-train=no\n')
    expect(text).toContain('Allow: /')
    expect(text).toContain('Disallow: /search')
  })

  it('points agents at the Markdown copies and lists the sitemap', () => {
    const text = buildRobotsTxt()
    expect(text).toContain(
      '# Index of Markdown copies for agents: https://gregrickaby.com/llms.txt',
    )
    expect(text).toContain('Sitemap: https://gregrickaby.com/sitemap.xml')
  })
})
