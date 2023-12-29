import {fetchGraphQL} from '@/lib/functions'
import {AllPosts} from '@/lib/types'

/**
 * Fetch blog posts.
 */
export default async function getPosts(limit = 1000) {
  const query = `
    query GetPosts($limit: Int!) {
      posts(where: {status: PUBLISH}, first: $limit) {
        edges {
          cursor
          node {
            commentCount
            databaseId
            title(format: RENDERED)
            slug
            date
            modified
            excerpt(format: RENDERED)
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
            }
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
    limit: limit
  }

  const response = await fetchGraphQL(query, variables)

  return response.data.posts as AllPosts
}
