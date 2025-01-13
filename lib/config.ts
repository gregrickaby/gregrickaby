import {
  IconBook,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconRss
} from '@tabler/icons-react'

const config = {
  siteName: 'Greg Rickaby',
  siteDescription: 'Cameras and Code',
  siteUrl: 'https://gregrickaby.com',
  siteLogo: '/logo.webp',
  siteOgImage: '/og.webp',
  jobTitle: 'Technical Lead',
  email: 'greg@gregrickaby.com',
  intro: 'Full-Stack Developer. Photographer. Author.',
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
      name: 'Photos',
      url: '/photos'
    },
    {
      name: 'Resume',
      url: '/resume'
    }
  ],
  socials: [
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
      name: 'Goodreads',
      url: 'https://www.goodreads.com/author/show/16999736.Greg_Rickaby',
      icon: IconBook
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
    }
  ],
  fancyboxOptions: {
    animated: false,
    groupAll: true,
    defaultDisplay: 'flex',
    Toolbar: {
      display: {
        left: ['infobar'],
        middle: ['zoomIn', 'zoomOut', 'toggle1to1'],
        right: ['slideshow', 'thumbs', 'download', 'close']
      }
    }
  }
}

export default config
