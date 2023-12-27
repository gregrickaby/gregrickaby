import {
  FaAmazon,
  FaCodepen,
  FaFacebook,
  FaGithub,
  FaGoodreadsG,
  FaInstagram,
  FaLinkedin,
  FaRss,
  FaThreads,
  FaWordpress,
  FaYoutube
} from 'react-icons/fa6'

const config = {
  siteName: 'Greg Rickaby',
  siteDescription: 'Web Developer / Photographer / Author',
  siteUrl: 'https://gregrickaby.com',
  siteLogo: '/logo.webp',
  siteOgImage: '/og.webp',
  jobTitle: 'Development Team Lead at WPForms',
  email: 'greg@gregrickaby.com',
  intro:
    'Disney Dad. Photographer. Published Author. Dev Team Lead at WPForms.',
  gravatarApiUrl:
    'https://en.gravatar.com/28af3e39c0a1fe4c31367c7e9a8bcac3.json',
  socials: [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/gregoryrickaby/',
      icon: FaInstagram
    },
    {
      name: 'Threads',
      url: 'https://www.threads.net/@gregoryrickaby',
      icon: FaThreads
    },
    {
      name: 'GitHub',
      url: 'https://github.com/gregrickaby/',
      icon: FaGithub
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/gregrickaby/',
      icon: FaLinkedin
    },
    {
      name: 'WordPress',
      url: 'https://profiles.wordpress.org/gregrickaby/',
      icon: FaWordpress
    },
    {
      name: 'Amazon Author',
      url: 'https://www.amazon.com/author/gregrickaby',
      icon: FaAmazon
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/gregrickaby',
      icon: FaFacebook
    },
    {
      name: 'Goodreads',
      url: 'https://www.goodreads.com/author/show/16999736.Greg_Rickaby',
      icon: FaGoodreadsG
    },
    {
      name: 'CodePen',
      url: 'https://codepen.io/gregrickaby',
      icon: FaCodepen
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@GregRickaby',
      icon: FaYoutube
    },
    {
      name: 'RSS Feed',
      url: 'https://gregrickaby.com/feed',
      icon: FaRss
    }
  ]
}

export default config
