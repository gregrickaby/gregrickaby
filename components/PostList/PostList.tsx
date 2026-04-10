import {PostCard} from '@/components/PostCard/PostCard'
import type {PostMeta} from '@/lib/types'
import {SimpleGrid} from '@mantine/core'

interface PostListProps {
  posts: PostMeta[]
}

export function PostList({posts}: Readonly<PostListProps>) {
  const featured = posts.slice(0, 2)
  const rest = posts.slice(2)

  return (
    <>
      <SimpleGrid cols={{base: 1, sm: 2}} spacing="xl" mb="xl">
        {featured.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </SimpleGrid>
      {rest.length > 0 && (
        <SimpleGrid cols={{base: 1, sm: 2, md: 3}} spacing="xl">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </SimpleGrid>
      )}
    </>
  )
}
