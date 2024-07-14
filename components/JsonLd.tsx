import config from '@/lib/config'

/**
 * JsonLD component.
 */
export default function JsonLD() {
  // Set Schema.org JSONLD format.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: config.siteName,
    jobTitle: config.jobTitle,
    url: config.siteUrl,
    sameAs: config.socials.map((social) => {
      return social.url
    })
  }

  // Convert to JSON string and format.
  const jsonLD = JSON.stringify(schema, null, 2)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: jsonLD}}
      data-testid="json-ld"
    />
  )
}
