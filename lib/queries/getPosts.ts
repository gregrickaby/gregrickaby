import {fetchGraphQL} from '@/lib/functions'
import {Post} from '@/lib/types'

/**
 * Fetch blog posts.
 */
export default async function getPosts(limit = 1000) {
  const query = `
    query GetPosts {
      posts(where: {status: PUBLISH}, first: ${limit}) {
        nodes {
          commentCount
          databaseId
          title
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
        }
      }
    }
  `

  const response = await fetchGraphQL(query)

  return response.data.posts.nodes as Post[]
}
