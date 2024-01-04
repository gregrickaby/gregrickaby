import {fetchGraphQL} from '@/lib/functions'
import {AllPosts} from '@/lib/types'

/**
 * Fetch a category archive by slug.
 */
export default async function getCategoryBySlug(slug: string, limit = 15) {
  const query = `
    query GetCategoryBySlug($slug: String!, $limit: Int!) {
      posts(where: {categoryName: $slug, status: PUBLISH}, first: $limit) {
        edges {
          cursor
          node {
            databaseId
            date
            excerpt(format: RENDERED)
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
            slug
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  `

  const variables = {
    slug: slug,
    limit: limit
  }

  const response = await fetchGraphQL(query, variables)

  return response.data.posts as AllPosts
}
