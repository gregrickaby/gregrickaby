import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import { HomeHero } from '@/components/home-hero'
import {
  CameraBag,
  CareerStrip,
  CurrentlyReading,
  GalleryStrip,
  HomeAbout,
  LatestWriting,
} from '@/components/home-sections'
import { getAllPosts, getPage, getPhotos } from '@/lib/content'
import { getCurrentlyReading } from '@/lib/goodreads'
import { buildPageMetadata } from '@/lib/metadata'
import { SITE } from '@/lib/site'

/** The site's name and roles, not the About page's title, which reads as an about page in search results. */
export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const metadata = await buildPageMetadata(
    { title: SITE.name, description: SITE.description, path: '/' },
    parent,
  )
  return {
    ...metadata,
    title: { absolute: `${SITE.name} - Software engineer, photographer, and author` },
  }
}

/** The home page: a photo banner, About beside the family photo, then career, writing, reading, photos, and gear in rows. */
export default async function HomePage() {
  const page = getPage('about')
  if (!page) notFound()
  const books = await getCurrentlyReading()

  return (
    <>
      <HomeHero />
      <HomeAbout page={page} />
      <CareerStrip />
      <LatestWriting posts={getAllPosts().slice(0, 3)} />
      <CurrentlyReading books={books} />
      <GalleryStrip photos={getPhotos().slice(0, 10)} />
      <CameraBag page={page} />
    </>
  )
}
