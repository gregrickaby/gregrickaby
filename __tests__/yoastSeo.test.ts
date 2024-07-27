import {mockPost} from '@/__tests__/__mocks__'
import config from '@/lib/config'
import {yoastSeo} from '@/lib/functions'
import {describe, expect, it} from 'vitest'

describe('yoastSeo() tests', () => {
  it('should return the correct metadata for a post', () => {
    const metadata = yoastSeo(mockPost)

    expect(metadata).toEqual({
      metadataBase: new URL(config.siteUrl),
      title: mockPost.yoast_head_json.title,
      description: mockPost.yoast_head_json.og_description,
      robots: {
        follow: true,
        index: true
      },
      alternates: {
        canonical: mockPost.yoast_head_json.canonical
      },
      openGraph: {
        type: 'article',
        title: mockPost.yoast_head_json.og_title,
        description: mockPost.yoast_head_json.og_description,
        url: mockPost.yoast_head_json.og_url,
        publishedTime: mockPost.yoast_head_json.article_published_time,
        modifiedTime: mockPost.yoast_head_json.article_modified_time,
        images: [
          {
            url: mockPost.yoast_head_json.og_image[0].url,
            width: mockPost.yoast_head_json.og_image[0].width,
            height: mockPost.yoast_head_json.og_image[0].height,
            type: mockPost.yoast_head_json.og_image[0].type,
            alt: 'article image'
          }
        ]
      }
    })
  })
})
