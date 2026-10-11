import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { HomeHero } from '@/components/home-hero'
import {
  CameraBag,
  CareerStrip,
  GalleryStrip,
  HomeAbout,
  LatestWriting,
} from '@/components/home-sections'
import { getAllPosts, getPage, getPhotos } from '@/lib/content'
import { buildContentMetadata } from '@/lib/metadata'

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const page = getPage('about')
  return page ? buildContentMetadata(page.meta, '/', parent) : {}
}

/** The home page: a photo banner, About beside the family photo, then career, writing, photos, and gear in rows. */
export default function HomePage() {
  const page = getPage('about')
  if (!page) notFound()

  return (
    <>
      <HomeHero />
      <HomeAbout page={page} />
      <CareerStrip />
      <LatestWriting posts={getAllPosts().slice(0, 3)} />
      <GalleryStrip photos={getPhotos().slice(0, 10)} />
      <CameraBag page={page} />
    </>
  )
}
