import {render} from '@/test-utils'
import {JsonLd} from './JsonLd'

describe('JsonLd', () => {
  it('renders a script tag with the serialized graph', () => {
    render(
      <JsonLd
        graph={{
          '@context': 'https://schema.org',
          '@graph': [
            {'@type': 'WebPage', '@id': 'https://example.com/#webpage'}
          ]
        }}
      />
    )
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script?.innerHTML).toContain('"@type":"WebPage"')
  })

  it('escapes angle brackets and ampersands in the serialized output', () => {
    render(
      <JsonLd
        graph={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              '@id': 'https://example.com/#webpage',
              name: '<script>alert(1)</script> & more'
            }
          ]
        }}
      />
    )
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script?.innerHTML).not.toContain('<script>alert')
    expect(script?.innerHTML).toContain('\\u003cscript\\u003e')
  })
})
