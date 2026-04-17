/**
 * Site-wide configuration constants including the site name, description,
 * URL, author details, and navigation links.
 *
 * @constant
 */
export const siteConfig = {
  name: 'Greg Rickaby',
  description:
    'Alabama-based software engineer, self-taught photographer, and published author.',
  url: 'https://gregrickaby.com',
  author: {
    name: 'Greg Rickaby',
    url: 'https://gregrickaby.com/about',
    linkedin: 'https://www.linkedin.com/in/gregrickaby/',
    github: 'https://github.com/gregrickaby'
  },
  nav: [
    {label: 'About', href: '/about', priority: 0.8},
    {label: 'Contact', href: '/contact', priority: 0.6},
    {label: 'Fun Stuff', href: '/fun-stuff', priority: 0.6},
    {label: 'Photos', href: '/photos', priority: 0.6},
    {label: 'Resume', href: '/resume', priority: 0.8},
    {label: 'RSS', href: '/feed.xml', external: true}
  ]
} as const
