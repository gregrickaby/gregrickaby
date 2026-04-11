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
    {label: 'About', href: '/about'},
    {label: 'Resume', href: '/resume'},
    {label: 'Contact', href: '/contact'},
    {label: 'Fun Stuff', href: '/fun-stuff'},
    {label: 'RSS', href: '/feed.xml', external: true}
  ]
} as const
