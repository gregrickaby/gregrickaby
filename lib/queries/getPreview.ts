import {fetchGraphQL} from '@/lib/functions'
import {Post} from '@/lib/types'

/**
 * Fetch a preview post.
 */
export default async function getPreview(id: string) {
  const query = `
    query PreviewPost($id: ID!) {
      post(id: $id, idType: DATABASE_ID) {
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
            gravatarUrl
            name
          }
        }
        date
        modified
        tags {
          nodes {
            databaseId
            name
          }
        }
        categories {
          nodes {
            databaseId
            name
          }
        }
        seo {
          metaDesc
          title
          readingTime
        }
        hideFeaturedImage {
          hideFeaturedImage
        }
      }
    }
  `

  const variables = {
    id: id
  }

  const response = await fetchGraphQL(query, variables, true)

  return response.data.post as Post
}
