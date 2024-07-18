import Image from 'next/image'
import Link from 'next/link'
import Logo from '../app/icon.png'

/**
 * Header component.
 */
export default function Header() {
  return (
    <header className="flex items-center gap-8" data-testid="header">
      <div>
        <a href="/">
          <Image
            alt="Greg Rickaby"
            className="rounded-full"
            height="120"
            priority={true}
            src={Logo}
            width="120"
          />
        </a>
      </div>
      <div className="not-prose space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">
          <a href="/">Greg Rickaby</a>
        </h1>
        <p className="text-xl font-bold">
          Full-Stack Engineer / Photographer / Author
        </p>
        <nav className="flex items-center gap-4">
          <Link className="underline" href="/blog">
            Blog
          </Link>
          <Link className="underline" href="/photos">
            Photos
          </Link>
          <Link className="underline" href="/media">
            Media
          </Link>
          <Link className="underline" href="/contact">
            Contact
          </Link>
          <Link className="underline" href="/resources">
            Resources
          </Link>
        </nav>
      </div>
    </header>
  )
}
