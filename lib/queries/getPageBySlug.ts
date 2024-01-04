import {fetchGraphQL} from '@/lib/functions'
import {Page} from '@/lib/types'

/**
 * Fetch a page by slug.
 */
export default async function getPageBySlug(slug: string) {
  const query = `
    query GetPageBySlug($slug: ID = "URI") {
      page(idType: URI, id: $slug) {
        databaseId
        content(format: RENDERED)
        title(format: RENDERED)
        featuredImage {
          node {
            altText
            sourceUrl
            mediaDetails {
                height
                width
            }
          }
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
        date
        modified
        seo {
          title
          metaDesc
          readingTime
          metaRobotsNofollow
          metaRobotsNoindex
          opengraphDescription
          opengraphTitle
          opengraphType
          opengraphUrl
          opengraphImage {
            altText
            sourceUrl(size: LARGE)
            mediaDetails {
              height
              width
            }
          }
        }
        hideFeaturedImage {
          hideFeaturedImage
        }
      }
    }
  `

  const variables = {
    slug: slug
  }

  const response = await fetchGraphQL(query, variables)

  return response.data.page as Page
}
