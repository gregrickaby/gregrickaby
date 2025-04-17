import {
  IconBook,
  IconBrandBluesky,
  IconBrandFacebook,
  IconBrandFlickr,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconRss
} from '@tabler/icons-react'

const config = {
  siteName: 'Greg Rickaby',
  siteDescription: 'Web Developer, Photographer, Published Author',
  siteUrl: 'https://gregrickaby.com',
  siteLogo: '/logo.webp',
  siteOgImage: '/og.webp',
  jobTitle: 'Tech Lead',
  email: 'greg@gregrickaby.com',
  navigation: [
    {
      name: 'Home',
      url: '/'
    },
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
      name: 'Bluesky',
      url: 'https://bsky.app/profile/gregrickaby.bsky.social',
      icon: IconBrandBluesky
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/gregrickaby/',
      icon: IconBrandFacebook
    },
    {
      name: 'Flickr',
      url: 'https://www.flickr.com/people/gregrickaby/',
      icon: IconBrandFlickr
    },
    {
      name: 'GitHub',
      url: 'https://github.com/gregrickaby/',
      icon: IconBrandGithub
    },
    {
      name: 'Goodreads',
      url: 'https://www.goodreads.com/author/show/16999736.Greg_Rickaby',
      icon: IconBook
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/gregoryrickaby/',
      icon: IconBrandInstagram
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/gregrickaby/',
      icon: IconBrandLinkedin
    },
    {
      name: 'RSS',
      url: 'https://gregrickaby.com/feed.xml',
      icon: IconRss
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@GregRickaby',
      icon: IconBrandYoutube
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
