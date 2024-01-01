/* Global types only */

export interface Children {
  children: React.ReactNode
}

export interface SearchResults {
  id: number
  title: string
  url: string
  type: string
  subtype: string
}

export interface GraphQLResponse<T = any> {
  data?: T
  errors?: Array<{message: string}>
}

export interface FeaturedImage {
  node: {
    altText: string
    sourceUrl: string
    mediaDetails: {
      height: number
      width: number
    }
  }
}

export interface Comments {
  edges: [
    {
      cursor: string
      node: {
        databaseId: string
        content: string
        date: string
        author: {
          node: {
            avatar: {
              url: string
            }
            email: string
            name: string
            url: string
          }
        }
      }
    }
  ]
}

export interface Menu {
  nodes: [
    {
      uri: string
      label: string
      databaseId: string
    }
  ]
}

export interface Page {
  author: {
    node: {
      name: string
      avatar: {
        url: string
      }
    }
  }
  databaseId: string
  date: string
  modified: string
  slug: string
  title: string
  excerpt: string
  content: string
  featuredImage: FeaturedImage
  seo: {
    metaDesc: string
    title: string
    readingTime: number
  }
  hideFeaturedImage: {
    hideFeaturedImage: boolean
  }
}

export interface Post {
  author: {
    node: {
      name: string
      avatar: {
        url: string
      }
    }
  }
  databaseId: string
  date: string
  modified: string
  slug: string
  title: string
  excerpt: string
  content: string
  commentCount: number
  categories: {
    nodes: [
      {
        databaseId: string
        name: string
        slug: string
      }
    ]
  }
  tags: {
    nodes: [
      {
        databaseId: string
        name: string
        slug: string
      }
    ]
  }
  featuredImage: FeaturedImage
  seo: {
    metaDesc: string
    title: string
    readingTime: number
  }
  comments: Comments
  hideFeaturedImage: {
    hideFeaturedImage: boolean
  }
}

export interface AllPages {
  pages: {
    nodes: Page[]
  }
}

export interface AllPosts {
  edges: [
    {
      cursor: string
      node: Post
      pageinfo: {
        endCursor: string
        hasNextPage: boolean
        hasPreviousPage: boolean
        startCursor: string
      }
    }
  ]
}

export interface GitHubRepo {
  name: string
  stargazers_count: number
  html_url: string
  description: string
  id: number
}
