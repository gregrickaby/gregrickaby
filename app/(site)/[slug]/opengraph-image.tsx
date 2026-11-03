import { getAllPosts, getPost } from '@/lib/content'
import { formatShortDate } from '@/lib/format'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'
import { SITE } from '@/lib/site'

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

/** One share image per post, with the post's title as its alt text. */
export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const title = getPost(params.slug)?.meta.title
  return [
    {
      id: 'card',
      alt: title ? `${title}, by ${SITE.name}` : `Blog, by ${SITE.name}`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ]
}

/** A post's share image: its featured photo, title, date, and category. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const meta = getPost(slug)?.meta
  return renderOgImage({
    title: meta?.title ?? 'Blog',
    eyebrow: meta
      ? [formatShortDate(meta.date), meta.categories?.[0]].filter(Boolean).join(' · ')
      : undefined,
    photo: meta?.featuredImage?.src,
  })
}
