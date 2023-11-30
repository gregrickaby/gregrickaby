import {fetchGraphQL} from '@/lib/functions'
import {Post} from '@/lib/types'

/**
 * Fetch blog posts.
 */
export default async function getPosts(limit = 100) {
  const query = `
    query GetPosts {
      posts(where: {status: PUBLISH}, first: ${limit}) {
        nodes {
          commentCount
          databaseId
          title
          slug
          excerpt(format: RENDERED)
          featuredImage {
            node {
              altText
              mediaDetails {
                sizes(include: MEDIUM) {
                  height
                  width
                  sourceUrl
                }
              }
            }
          }
        }
      }
    }
  `

  const response = await fetchGraphQL(query)

  return response.data.posts.nodes as Post[]
}
