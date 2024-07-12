import {fetchGraphQL} from '@/lib/functions'
import {CategoryTag} from '@/lib/types'

/**
 * Fetch all non-empty categories.
 */
export default async function getCategories(limit = 100) {
  const query = `
    query GetCategories($limit: Int!) {
      categories(first: $limit, where: {hideEmpty: true}) {
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

  return response.data.categories as CategoryTag
}
