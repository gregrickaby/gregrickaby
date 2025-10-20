import {Container, Stack, Title, Text} from '@mantine/core'
import type {Metadata} from 'next'
import {Suspense} from 'react'
import {InfinitePostList} from '@/components/UI/InfinitePostList'
import {getPosts} from '@/lib/wordpress'
import {siteConfig} from '@/lib/config'

/**
 * Force dynamic rendering (no static generation or caching).
 * This ensures we always fetch fresh data from WordPress.
 */
export const dynamic = 'force-dynamic'

/**
 * Metadata for the blog listing page.
 */
export const metadata: Metadata = {
  title: `Blog - ${siteConfig.name}`,
  description:
    'Read the latest blog posts about web development, photography, and technology.',
  alternates: {
    canonical: '/blog'
  },
  openGraph: {
    title: `Blog - ${siteConfig.name}`,
    description:
      'Read the latest blog posts about web development, photography, and technology.',
    type: 'website',
    url: '/blog'
  }
}

/**
 * Blog posts loader component.
 */
async function BlogPostsLoader() {
  const data = await getPosts(12)

  if (!data.posts?.edges || data.posts.edges.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No posts found.
      </Text>
    )
  }

  const initialPosts = data.posts.edges.map((edge) => edge.node)

  return (
    <InfinitePostList
      initialPosts={initialPosts}
      initialHasNextPage={data.posts.pageInfo.hasNextPage}
      initialEndCursor={data.posts.pageInfo.endCursor}
    />
  )
}

/**
 * Blog listing page with infinite scroll.
 */
export default function BlogPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap="sm">
          <Title order={1}>Blog</Title>
          <Text c="dimmed">
            Thoughts on web development, photography, and technology.
          </Text>
        </Stack>

        <Suspense
          fallback={
            <Text c="dimmed" ta="center" py="xl">
              Loading posts...
            </Text>
          }
        >
          <BlogPostsLoader />
        </Suspense>
      </Stack>
    </Container>
  )
}
