'use client'

import LatestPosts from '@/components/PostList'
import getPosts from '@/lib/queries/getPosts'
import {AllPosts} from '@/lib/types'
import {useState} from 'react'

/**
 * The more posts component.
 */
export default function MorePosts({endCursor}: Readonly<{endCursor: string}>) {
  const [posts, setPosts] = useState<AllPosts>({
    edges: [],
    pageInfo: {endCursor: ''}
  })

  // Fetch handler.
  async function fetchPosts() {
    // Set the cursor.
    const cursor = posts.pageInfo.endCursor || endCursor

    // Fetch posts from WordPress.
    const paginatedPosts = await getPosts(15, cursor)

    // No posts? Bail.
    if (!paginatedPosts) {
      return
    }

    // Merge the previous posts with the new posts.
    setPosts({
      edges: [...posts.edges, ...paginatedPosts.edges],
      pageInfo: paginatedPosts.pageInfo
    })
  }

  return (
    <>
      {posts.edges.length > 0 && (
        <div className="my-8">
          <LatestPosts posts={posts} />
        </div>
      )}
      <button className="mx-auto my-10 flex" onClick={fetchPosts}>
        Load More Posts
      </button>
    </>
  )
}
