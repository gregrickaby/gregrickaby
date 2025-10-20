/**
 * GraphQL queries for WordPress pages.
 *
 * These queries fetch pages with Yoast SEO metadata and featured images.
 */

/**
 * Query to get a single page by slug.
 */
export const GET_PAGE_BY_SLUG_QUERY = /* GraphQL */ `
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      databaseId
      title
      content
      slug
      uri
      date
      modified
      featuredImage {
        node {
          id
          sourceUrl
          altText
          title
          caption
          description
          mediaDetails {
            width
            height
          }
          sizes
          srcSet
        }
      }
      author {
        node {
          id
          databaseId
          name
          firstName
          lastName
          description
          avatar {
            url
          }
        }
      }
      seo {
        title
        metaDesc
        canonical
        opengraphTitle
        opengraphDescription
        opengraphType
        opengraphUrl
        opengraphImage {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
        twitterTitle
        twitterDescription
        twitterImage {
          sourceUrl
          altText
        }
        schema {
          raw
        }
        metaRobotsNoindex
        metaRobotsNofollow
        breadcrumbs {
          text
          url
        }
      }
    }
  }
`

/**
 * Query to get all page slugs for static generation.
 */
export const GET_ALL_PAGE_SLUGS_QUERY = /* GraphQL */ `
  query GetAllPageSlugs {
    pages(first: 10000, where: {status: PUBLISH}) {
      nodes {
        slug
      }
    }
  }
`
