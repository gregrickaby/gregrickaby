import {PostCard} from '@/components/PostCard/PostCard'
import type {PostMeta} from '@/lib/types'
import {SimpleGrid, Stack, Title} from '@mantine/core'

/**
 * Props for the FromArchives component.
 *
 * @interface
 */
interface FromArchivesProps {
  /** Older posts to surface above the main blog listing. */
  posts: PostMeta[]
}

/**
 * Section highlighting a handful of older posts above the main blog listing,
 * so posts buried on later pages still get visibility.
 *
 * @param props - The props for the FromArchives component.
 * @returns A React element with the archive heading and post grid, or null when there are no posts to show.
 */
export function FromArchives({posts}: Readonly<FromArchivesProps>) {
  if (posts.length === 0) return null

  return (
    <Stack mb="xl" gap="md">
      <Title order={2}>From The Archives</Title>
      <SimpleGrid cols={{base: 1, sm: 3}} spacing="xl">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
