import {fetchGraphQL} from '@/lib/functions'
import {Page} from '@/lib/types'

/**
 * Fetch pages.
 */
export default async function getPages(limit = 1000) {
  const query = `
    query GetPages {
      pages(where: {status: PUBLISH}, first: ${limit}) {
        nodes {
          content(format: RENDERED)
          databaseId
          date
          modified
          excerpt(format: RENDERED)
          slug
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
        }
      }
    }
  `

  const response = await fetchGraphQL(query, {}, 'getPages')

  return response.data.pages.nodes as Page[]
}
