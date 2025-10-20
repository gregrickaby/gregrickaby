/**
 * GraphQL queries for WordPress posts.
 *
 * These queries fetch posts with Yoast SEO metadata and featured images.
 */

/**
 * Query to get all posts with pagination.
 */
export const GET_POSTS_QUERY = /* GraphQL */ `
  query GetPosts($first: Int = 10, $after: String) {
    posts(first: $first, after: $after, where: {status: PUBLISH}) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          databaseId
          title
          slug
          uri
          date
          modified
          excerpt
          isSticky
          featuredImage {
            node {
              id
              sourceUrl
              altText
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
              name
              firstName
              lastName
              avatar {
                url
              }
            }
          }
          categories {
            nodes {
              id
              databaseId
              name
              slug
              uri
            }
          }
          tags {
            nodes {
              id
              databaseId
              name
              slug
              uri
            }
          }
          seo {
            title
            metaDesc
            canonical
            opengraphTitle
            opengraphDescription
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
          }
        }
      }
    }
  }
`

/**
 * Query to get a single post by slug.
 */
export const GET_POST_BY_SLUG_QUERY = /* GraphQL */ `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      content
      slug
      uri
      date
      modified
      excerpt
      isSticky
      commentCount
      commentStatus
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
          email
          description
          avatar {
            url
          }
          uri
          slug
        }
      }
      categories {
        nodes {
          id
          databaseId
          name
          slug
          uri
          description
          count
        }
      }
      tags {
        nodes {
          id
          databaseId
          name
          slug
          uri
          description
          count
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
 * Query to get all post slugs for static generation.
 */
export const GET_ALL_POST_SLUGS_QUERY = /* GraphQL */ `
  query GetAllPostSlugs {
    posts(first: 10000, where: {status: PUBLISH}) {
      nodes {
        slug
      }
    }
  }
`
