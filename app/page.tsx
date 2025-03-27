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
      <div className="article spacy-y-8 text-center">
        <h1>👋 Hello There!</h1>
        <p className="text-xl">
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
            published author
          </a>{' '}
          who&apos;s been building websites since the{' '}
          <a
            aria-label="view my geocties web page"
            href="https://gregrickaby.com/geocities"
            rel="nofollow"
          >
            Geocities
          </a>{' '}
          days
        </p>
        <Link
          href="/about"
          className="button inline-flex px-4 py-2 text-xl no-underline!"
        >
          Learn More{' '}
        </Link>
      </div>
      <Carousel images={images} />
    </>
  )
}
