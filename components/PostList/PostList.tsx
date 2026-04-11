import {PostCard} from '@/components/PostCard/PostCard'
import type {PostMeta} from '@/lib/types'
import {SimpleGrid} from '@mantine/core'

/**
 * Props for the PostList component.
 *
 * @interface
 */
interface PostListProps {
  /** Array of post metadata to display. */
  posts: PostMeta[]
}

/**
 * Grid component displaying a list of posts as cards.
 * The first two posts are featured at the top in a 2-column layout.
 * Remaining posts display in a 3-column grid below.
 *
 * @param props - The props for the PostList component.
 * @returns A React element with the posts grid.
 */
export function PostList({posts}: Readonly<PostListProps>) {
  const featured = posts.slice(0, 2)
  const rest = posts.slice(2)

  return (
    <>
      <SimpleGrid cols={{base: 1, sm: 2}} spacing="xl" mb="xl">
        {featured.map((post) => (
          <PostCard key={post.slug} post={post} priority />
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
