import {fetchGraphQL} from '@/lib/functions'
import {CategoryTag} from '@/lib/types'

/**
 * Fetch all non-empty categories.
 */
export default async function getTags(limit = 100) {
  const query = `
    query GetTags($limit: Int!) {
      tags(first: $limit, where: {hideEmpty: false}) {
        edges {
          node {
            databaseId
            name
            slug
          }
        }
      }
    }
  `

  const variables = {
    limit: limit
  }

  const response = await fetchGraphQL(query, variables)

  return response.data.tags as CategoryTag
}
