import {AppLink} from '@/components/AppLink/AppLink'
import type {PostMeta} from '@/lib/types'
import {getFeaturedImagePath} from '@/lib/utils'
import {Box, Text, Title} from '@mantine/core'
import Image from 'next/image'
import styles from './PostCard.module.css'

interface PostCardProps {
  post: PostMeta
}

export function PostCard({post}: Readonly<PostCardProps>) {
  const featuredImage = getFeaturedImagePath(post)
  const href = `/${post.slug}`

  return (
    <Box className={styles.card}>
      {featuredImage && (
        <Box className={styles.imageWrapper}>
          <AppLink href={href} aria-label={post.title}>
            <Image
              alt={post.title}
              loading="lazy"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={featuredImage}
              className={styles.image}
            />
          </AppLink>
        </Box>
      )}
      <Title order={3} mt="md" mb="xs">
        <AppLink href={href}>{post.title}</AppLink>
      </Title>
      {post.description && (
        <Text c="dimmed" lineClamp={5}>
          {post.description}
        </Text>
      )}
    </Box>
  )
}
