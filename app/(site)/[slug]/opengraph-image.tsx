import { getAllPosts, getPost } from '@/lib/content'
import { formatShortDate } from '@/lib/format'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const alt = 'Blog post'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
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
