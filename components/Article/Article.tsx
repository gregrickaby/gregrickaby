import {AppLink} from '@/components/AppLink/AppLink'
import {ArticleContent} from '@/components/ArticleContent/ArticleContent'
import type {PostMeta} from '@/lib/types'
import {
  formatPostDate,
  getFeaturedImagePath,
  getFirstContentImageSrc
} from '@/lib/utils'
import {Box, Group, Text, Title, Typography} from '@mantine/core'
import Image from 'next/image'
import styles from './Article.module.css'

interface ArticleProps {
  meta: PostMeta
  content: string
}

export function Article({meta, content}: Readonly<ArticleProps>) {
  const featuredImage = getFeaturedImagePath(meta)
  const firstContentImage = getFirstContentImageSrc(content)
  const showFeaturedImage =
    featuredImage !== null && featuredImage !== firstContentImage

  return (
    <article className={styles.article}>
      <header>
        {meta.type === 'post' && (
          <Text className={styles.meta}>
            {formatPostDate(meta.date)}
            {meta.categories?.length ? (
              <>
                {' · '}
                {meta.categories.map((cat, i) => (
                  <span key={cat}>
                    {i > 0 && ', '}
                    <AppLink href={`/category/${encodeURIComponent(cat)}`}>
                      {cat}
                    </AppLink>
                  </span>
                ))}
              </>
            ) : null}
          </Text>
        )}
        <Title order={1} className={styles.title}>
          {meta.title}
        </Title>
        {meta.description && (
          <Text className={styles.description}>{meta.description}</Text>
        )}
      </header>

      {showFeaturedImage && (
        <Box className={styles.featuredImage}>
          <Image
            alt={meta.title}
            height={450}
            priority
            src={featuredImage}
            style={{width: '100%', height: 'auto'}}
            width={800}
          />
        </Box>
      )}

      <Typography>
        <ArticleContent content={content} />
      </Typography>

      {meta.tags && meta.tags.length > 0 && (
        <footer className={styles.tags}>
          <Group gap="xs">
            {meta.tags.map((tag) => (
              <AppLink
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className={styles.tag}
              >
                {tag}
              </AppLink>
            ))}
          </Group>
        </footer>
      )}
    </article>
  )
}
