import {PageContent} from '@/components/UI/PageContent'
import {PostContent} from '@/components/UI/PostContent'
import {getContentBySlug, isPageContent, isPostContent} from '@/lib/wordpress'
import {Container, Text} from '@mantine/core'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'

/**
 * Force dynamic rendering (no static generation or caching).
 * This ensures we always fetch fresh data from WordPress.
 */
export const dynamic = 'force-dynamic'

/**
 * Page props for dynamic slug route.
 */
interface SlugPageProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * Generate metadata for SEO using Yoast data.
 */
export async function generateMetadata(
  props: Readonly<SlugPageProps>
): Promise<Metadata> {
  const params = await props.params
  const {data, type} = await getContentBySlug(params.slug)

  if (!data) {
    return {
      title: 'Content Not Found',
      description: 'The requested content could not be found.'
    }
  }

  const seo = data.seo

  // Use Yoast SEO metadata if available, fallback to content data
  const title = seo?.title ?? data.title ?? 'Content'
  const description =
    seo?.metaDesc ??
    (isPostContent(data)
      ? data.excerpt?.replace(/<[^>]*>/g, '').trim()
      : undefined) ??
    'Read this content'

  const ogImage = seo?.opengraphImage
    ? {
        url: seo.opengraphImage.sourceUrl,
        width: seo.opengraphImage.mediaDetails?.width,
        height: seo.opengraphImage.mediaDetails?.height,
        alt: seo.opengraphImage.altText ?? title
      }
    : undefined

  return {
    title,
    description,
    alternates: {
      canonical: seo?.canonical ?? `/${params.slug}`
    },
    openGraph: {
      title: seo?.opengraphTitle ?? title,
      description: seo?.opengraphDescription ?? description,
      type: type === 'post' ? 'article' : 'website',
      url: seo?.opengraphUrl ?? `/${params.slug}`,
      ...(type === 'post' &&
        isPostContent(data) && {
          publishedTime: data.date,
          modifiedTime: data.modified,
          authors: data.author?.node?.name ? [data.author.node.name] : undefined
        }),
      images: ogImage ? [ogImage] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.twitterTitle ?? title,
      description: seo?.twitterDescription ?? description,
      images: seo?.twitterImage?.sourceUrl
        ? [seo.twitterImage.sourceUrl]
        : undefined
    }
  }
}

/**
 * Content component that renders either a post or page.
 */
async function ContentRenderer({slug}: Readonly<{slug: string}>) {
  const {data, type} = await getContentBySlug(slug)

  if (!data) {
    notFound()
  }

  // Render based on content type
  if (type === 'post' && isPostContent(data)) {
    return <PostContent post={data} />
  }

  if (type === 'page' && isPageContent(data)) {
    return <PageContent page={data} />
  }

  // Fallback (should never reach here)
  notFound()
}

/**
 * Dynamic slug page that handles both posts and pages.
 */
export default async function SlugPage(props: Readonly<SlugPageProps>) {
  const params = await props.params

  return (
    <Container size="md" py="xl">
      <Suspense
        fallback={
          <Text c="dimmed" ta="center" py="xl">
            Loading...
          </Text>
        }
      >
        <ContentRenderer slug={params.slug} />
      </Suspense>
    </Container>
  )
}
