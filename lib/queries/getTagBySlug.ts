import {fetchGraphQL} from '@/lib/functions'
import {AllPosts} from '@/lib/types'

/**
 * Fetch a tag archive by slug.
 */
export default async function getTagBySlug(slug: string, limit = 15) {
  const query = `
    query GetTagBySlug($slug: String!, $limit: Int!) {
      posts(where: {tag: $slug, status: PUBLISH}, first: $limit) {
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
              metaDesc
              title
              readingTime
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
