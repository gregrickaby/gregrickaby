import robots from './robots'

describe('robots.ts', () => {
  it('returns a valid robots config', () => {
    const result = robots()
    expect(result).toEqual({
      rules: {
        userAgent: '*',
        allow: '/'
      },
      sitemap: 'https://gregrickaby.com/sitemap.xml'
    })
  })
})
