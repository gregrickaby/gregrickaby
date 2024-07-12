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
          edges {
            node {
              databaseId
              name
              slug
            }
          }
        }
        categories {
          edges {
            node {
              databaseId
              name
              slug
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
