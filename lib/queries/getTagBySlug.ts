import {fetchGraphQL} from '@/lib/functions'
import {AllPosts} from '@/lib/types'

/**
 * Fetch a tag archive by slug.
 */
export default async function getTagBySlug(
  slug: string,
  limit = 12,
  after = '',
  before = ''
) {
  const query = `
    query GetTagBySlug($slug: String!, $limit: Int!, $after: String, $before: String) {
      posts(where: {tag: $slug, status: PUBLISH}, first: $limit, after: $after, before: $before) {
        edges {
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
              canonical
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
    slug,
    limit,
    after,
    before
  }

  const response = await fetchGraphQL(query, variables)

  return response.data.posts as AllPosts
}
