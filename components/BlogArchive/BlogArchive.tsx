'use client'

import {ArticleCard} from '@/components/ArticleCard'
import {WP_Query} from '@/lib/api'
import {Post} from '@/lib/types'
import {useCallback, useState} from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

/**
 * Blog Archive route.
 */
export function BlogArchive({initialPosts}: {initialPosts: Post[]}) {
  // Set up state.
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState<number>(2)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  // Fetch more posts.
  const fetchPosts = useCallback(async () => {
    // Prevent multiple fetches at the same time.
    if (loading) return

    setLoading(true)
    try {
      // Set up pagination query.
      const query = new WP_Query({
        per_page: 10,
        page: page,
        fields: [
          'id',
          'slug',
          'title',
          'excerpt',
          'featured_image_data',
          'date'
        ],
        orderby: 'date',
        order: 'desc'
      })

      // Get the next posts.
      const newPosts = await query.getPosts()

      // Update state.
      if (newPosts.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts])
        setPage((prevPage) => prevPage + 1)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, page])

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchPosts}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
      endMessage={
        <p style={{textAlign: 'center'}}>
          <b>Yay! You have seen all my posts!</b>
        </p>
      }
    >
      {posts.map((post) => (
        <ArticleCard key={post.id} post={post} />
      ))}
    </InfiniteScroll>
  )
}
