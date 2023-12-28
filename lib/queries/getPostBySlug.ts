import {fetchGraphQL} from '@/lib/functions'
import {Post} from '@/lib/types'

/**
 * Fetch a single blog post by slug.
 */
export default async function getPostBySlug(slug: string) {
  const query = `
    query GetPost($slug: ID!) {
      post(id: $slug, idType: SLUG) {
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
            name
            avatar {
              url
            }
          }
        }
        date
        modified
        tags {
          nodes {
            databaseId
            name
            slug
          }
        }
        categories {
          nodes {
            databaseId
            name
            slug
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
        comments(first: 10, where: {order: ASC, status: "APPROVED"}) {
          edges {
            cursor
            node {
              databaseId
              date
              content(format: RENDERED)
              author {
                node {
                  avatar {
                    url
                  }
                  email
                  name
                  url
                }
              }
            }
          }
        }
      }
    }
  `

  const variables = {
    slug: slug
  }

  const response = await fetchGraphQL(query, variables)

  return response.data.post as Post
}
