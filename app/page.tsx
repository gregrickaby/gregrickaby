import {Carousel} from '@/components/Carousel/Carousel'
import {getCarouselImages} from '@/lib/functions/getCarouselImages'
import Link from 'next/link'

/**
 * The home page route.
 */
export default async function Home() {
  const images = await getCarouselImages()

  return (
    <>
      <div className="article">
        <h1 className="pb-4 text-center lg:pt-16">👋 Hello There!</h1>
        <p>
          I&apos;m a{' '}
          <a
            aria-label="follow on LinkedIn"
            href="https://www.linkedin.com/in/gregrickaby/"
            rel="author"
          >
            web developer
          </a>
          ,{' '}
          <Link
            aria-label="view my photos"
            href="https://flickr.com/photos/gregrickaby"
          >
            photographer
          </Link>
          , and{' '}
          <a
            aria-label="view my amazon author profile"
            href="https://www.amazon.com/author/gregrickaby"
            rel="author"
          >
            author
          </a>{' '}
          who&apos;s been building websites since the{' '}
          <a
            aria-label="view my geocties web page"
            href="https://gregrickaby.com/geocities"
            rel="nofollow"
          >
            Geocities
          </a>{' '}
          days. As a Tech Lead at <a href="https://mindsize.com/">Mindsize</a>,
          I support a talented team working on e-commerce solutions with
          Next.js. Outside of work, I&apos;m married with three kids, and enjoy
          cooking, traveling, and reading.
        </p>
      </div>
      <Carousel images={images} />
    </>
  )
}
