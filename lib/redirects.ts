/**
 * Permanent redirects for old WordPress URLs and other legacy paths. Pages
 * with no replacement answer 410 instead (lib/gone.ts).
 */
export const redirects = [
  // Legacy feed URL.
  { source: '/feed', destination: '/feed.xml', permanent: true },
  { source: '/blog/feed', destination: '/feed.xml', permanent: true },
  { source: '/feed/atom', destination: '/feed.xml', permanent: true },

  // Browsers and crawlers ask for these by name, ignoring the icon link tag.
  { source: '/favicon.ico', destination: '/icon.jpg', permanent: true },
  { source: '/apple-touch-icon.png', destination: '/icon.jpg', permanent: true },
  { source: '/apple-touch-icon-precomposed.png', destination: '/icon.jpg', permanent: true },

  // Yoast's sitemap index.
  { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },

  // About is now the homepage.
  { source: '/about', destination: '/', permanent: true },
  { source: '/home', destination: '/', permanent: true },

  // Old WordPress date-based URLs that map to existing posts. The rest answer
  // 410 from proxy.ts (lib/gone.ts).
  {
    source: '/2013/05/microphone-shootout-behringer-b-1-vs-neumann-tlm-103',
    destination: '/microphone-shootout-behringer-b-1-vs-neumann-tlm-103',
    permanent: true,
  },
  {
    source: '/2014/03/hello-chloe-grace',
    destination: '/hello-chloe-grace',
    permanent: true,
  },
  {
    source: '/2017/02/2016-a-year-in-review',
    destination: '/2016-a-year-in-review',
    permanent: true,
  },

  // Old WordPress pagination. The blog lists every post on one page.
  { source: '/page/:num', destination: '/blog', permanent: true },
  { source: '/blog/page/:num', destination: '/blog', permanent: true },

  // Tags folded into broader ones.
  { source: '/tag/astrophotography', destination: '/tag/photography', permanent: true },
  { source: '/tag/automatic1111', destination: '/tag/ai', permanent: true },
  { source: '/tag/chase', destination: '/tag/family', permanent: true },
  { source: '/tag/chloe', destination: '/tag/family', permanent: true },
  { source: '/tag/gallery', destination: '/tag/photography', permanent: true },
  { source: '/tag/genesis', destination: '/tag/wordpress', permanent: true },
  { source: '/tag/hdr', destination: '/tag/photography', permanent: true },
  { source: '/tag/kids', destination: '/tag/family', permanent: true },
  { source: '/tag/moon', destination: '/tag/photography', permanent: true },
  { source: '/tag/personal', destination: '/tag/family', permanent: true },
  { source: '/tag/radio', destination: '/tag/audio', permanent: true },
  { source: '/tag/react', destination: '/tag/javascript', permanent: true },
  { source: '/tag/snippets', destination: '/tag/tutorials', permanent: true },
  { source: '/tag/tara', destination: '/tag/family', permanent: true },
  { source: '/tag/typography', destination: '/tag/css', permanent: true },
  { source: '/tag/wyatt', destination: '/tag/family', permanent: true },

  // Old tags with spaces in their names.
  { source: '/tag/gain%20map', destination: '/tag/photography', permanent: true },
  { source: '/tag/how%20to', destination: '/tag/tutorials', permanent: true },
  { source: '/tag/stable%20diffusion', destination: '/tag/ai', permanent: true },
]
