'use client'

import {useState, useEffect, useRef, useCallback} from 'react'
import {Stack, Text, Loader, Center} from '@mantine/core'
import {PostCard} from './PostCard'
import type {Post} from '@/lib/wordpress/types'

export interface InfinitePostListProps {
  initialPosts: Post[]
  initialHasNextPage: boolean
  initialEndCursor: string | null
}

/**
 * Infinite scroll post list component.
 * Loads more posts as user scrolls to the bottom.
 */
export function InfinitePostList({
  initialPosts,
  initialHasNextPage,
  initialEndCursor
}: Readonly<InfinitePostListProps>) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [endCursor, setEndCursor] = useState(initialEndCursor)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Function to load more posts
  const loadMore = useCallback(async () => {
    if (isLoading || !hasNextPage || !endCursor) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/posts?after=${encodeURIComponent(endCursor)}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()

      if (data.posts?.edges) {
        const newPosts = data.posts.edges.map((edge: {node: Post}) => edge.node)
        setPosts((prev) => [...prev, ...newPosts])
        setHasNextPage(data.posts.pageInfo.hasNextPage)
        setEndCursor(data.posts.pageInfo.endCursor)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts')
    } finally {
      setIsLoading(false)
    }
  }, [endCursor, hasNextPage, isLoading])

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isLoading) {
          loadMore()
        }
      },
      {threshold: 0.1}
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasNextPage, isLoading, loadMore])

  return (
    <Stack gap="xl">
      {/* Post Grid */}
      <Stack gap="lg">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </Stack>

      {/* Loading Indicator */}
      {isLoading && (
        <Center py="xl">
          <Loader size="md" />
        </Center>
      )}

      {/* Error Message */}
      {error && (
        <Text c="red" ta="center" size="sm">
          {error}
        </Text>
      )}

      {/* End of Posts Message */}
      {!hasNextPage && posts.length > 0 && (
        <Text c="dimmed" ta="center" size="sm" py="xl">
          You&apos;ve reached the end!
        </Text>
      )}

      {/* Intersection Observer Target */}
      <div ref={observerTarget} style={{height: '1px'}} />
    </Stack>
  )
}
