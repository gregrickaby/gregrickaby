import {
  IconBook,
  IconBrandAmazon,
  IconBrandCodepen,
  IconBrandFacebook,
  IconBrandFeedly,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandThreads,
  IconBrandWordpress,
  IconBrandYoutube,
  IconRss
} from '@tabler/icons-react'

const config = {
  siteName: 'Greg Rickaby',
  siteDescription: 'Cameras and Code',
  siteUrl: 'https://gregrickaby.com',
  siteLogo: '/logo.webp',
  siteOgImage: '/og.webp',
  jobTitle: 'Web Developer',
  email: 'greg@gregrickaby.com',
  intro: 'Disney Dad. Full-Stack Engineer. Photographer. Author.',
  gravatarApiUrl:
    'https://en.gravatar.com/28af3e39c0a1fe4c31367c7e9a8bcac3.json',
  navigation: [
    {
      name: 'About',
      url: '/about'
    },
    {
      name: 'Blog',
      url: '/blog'
    },
    {
      name: 'Contact',
      url: '/contact'
    },
    {
      name: 'Github',
      url: 'https://github.com/gregrickaby'
    },
    {
      name: 'Media',
      url: '/media'
    },
    {
      name: 'Photos',
      url: '/photos'
    },
    {
      name: 'Resources',
      url: '/resources'
    },
    {
      name: 'Resume',
      url: '/resume'
    }
  ],
  socials: [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/gregoryrickaby/',
      icon: IconBrandInstagram
    },
    {
      name: 'Threads',
      url: 'https://www.threads.net/@gregoryrickaby',
      icon: IconBrandThreads
    },
    {
      name: 'GitHub',
      url: 'https://github.com/gregrickaby/',
      icon: IconBrandGithub
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/gregrickaby/',
      icon: IconBrandLinkedin
    },
    {
      name: 'WordPress',
      url: 'https://profiles.wordpress.org/gregrickaby/',
      icon: IconBrandWordpress
    },
    {
      name: 'Amazon Author',
      url: 'https://www.amazon.com/author/gregrickaby',
      icon: IconBrandAmazon
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/gregrickaby',
      icon: IconBrandFacebook
    },
    {
      name: 'Goodreads',
      url: 'https://www.goodreads.com/author/show/16999736.Greg_Rickaby',
      icon: IconBook
    },
    {
      name: 'CodePen',
      url: 'https://codepen.io/gregrickaby',
      icon: IconBrandCodepen
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@GregRickaby',
      icon: IconBrandYoutube
    },
    {
      name: 'RSS Feed',
      url: 'https://gregrickaby.com/feed.xml',
      icon: IconRss
    },
    {
      name: 'Feedly',
      url: 'https://feedly.com/i/subscription/feed%2Fhttps%3A%2F%2Fgregrickaby.com%2Ffeed.xml',
      icon: IconBrandFeedly
    }
  ]
}

export default config
