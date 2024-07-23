import {Post} from '@/types/types'

export const mockPost: Post = {
  id: 1,
  date: new Date(),
  slug: 'sienna-by-starlight',
  status: 'publish',
  title: {
    rendered: 'Sienna by Starlight'
  },
  content: {
    rendered: '<p>This is the content of the post.</p>',
    protected: false
  },
  excerpt: {
    rendered: '<p>This is the excerpt of the post.</p>',
    protected: false
  },
  category_names: [
    {
      id: 10,
      name: 'Category1'
    },
    {
      id: 20,
      name: 'Category2'
    }
  ],
  tag_names: [
    {
      id: 30,
      name: 'Tag1'
    },
    {
      id: 40,
      name: 'Tag2'
    }
  ],
  featured_image_data: {
    url: 'https://gregrickaby.com/image.jpg',
    height: 800,
    width: 1200,
    alt: 'Featured image description'
  },
  acf: {
    hide_featured_image: false
  },
  yoast_head_json: {
    title: 'Sienna by Starlight - Greg Rickaby',
    robots: {
      index: 'index',
      follow: 'follow',
      'max-snippet': 'max-snippet:-1',
      'max-image-preview': 'max-image-preview:large',
      'max-video-preview': 'max-video-preview:-1'
    },
    canonical: 'https://gregrickaby.com/sienna-by-starlight',
    og_locale: 'en_US',
    og_type: 'article',
    og_title: 'Sienna by Starlight - Greg Rickaby',
    og_description: 'A detailed description for SEO purposes.',
    og_url: 'https://gregrickaby.com/sienna-by-starlight',
    og_site_name: 'Greg Rickaby',
    article_published_time: new Date(),
    article_modified_time: new Date(),
    og_image: [
      {
        url: 'https://blog.gregrickaby.com/wp-content/uploads/2023/06/DSC9281_Sienna-By-Starlight_20230628.jpg',
        width: 3840,
        height: 2560,
        type: 'image/jpeg'
      }
    ],
    author: 'Greg Rickaby',
    twitter_card: 'summary_large_image',
    twitter_creator: '@https://twitter.com/GregRickaby',
    twitter_site: '@GregRickaby',
    twitter_misc: {
      'Written by': 'Greg Rickaby'
    },
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://gregrickaby.com/#website',
          url: 'https://gregrickaby.com/',
          name: 'Greg Rickaby',
          description: 'A detailed description for SEO purposes.',
          publisher: {
            '@id': 'https://gregrickaby.com/#website'
          }
        }
      ]
    }
  }
}
