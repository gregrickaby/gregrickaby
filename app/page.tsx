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
        <h1 className="font-mono">👋 Hello there!</h1>
        <p className="font-sans! text-2xl">
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
          ,{' '}
          <a
            aria-label="view my amazon author profile"
            href="https://www.amazon.com/author/gregrickaby"
            rel="author"
          >
            published author,
          </a>{' '}
          and proud survivor of the{' '}
          <a
            aria-label="view my geocties web page"
            href="https://gregrickaby.com/geocities"
            rel="nofollow"
          >
            Geocities days
          </a>
          . Currently, I work as a Tech Lead at{' '}
          <a href="https://mindsize.com" rel="nofollow">
            Mindsize
          </a>
          .
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
