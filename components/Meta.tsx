export default function Meta() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Greg Rickaby',
    jobTitle: 'Development Team Lead at WPForms',
    url: 'https://gregrickaby.com',
    sameAs: [
      'https://codepen.io/gregrickaby',
      'https://github.com/gregrickaby/',
      'https://gregrickaby.com/blog/',
      'https://linkedin.com/in/gregrickaby/',
      'https://profiles.wordpress.org/gregrickaby/',
      'https://www.amazon.com/author/gregrickaby',
      'https://www.facebook.com/gregrickaby',
      'https://www.goodreads.com/author/show/16999736.Greg_Rickaby',
      'https://www.instagram.com/gregoryrickaby/',
      'https://www.threads.net/@gregoryrickaby',
      'https://www.youtube.com/@GregRickaby'
    ]
  }

  return <script type="application/ld+json">{JSON.stringify(schema)}</script>
}
