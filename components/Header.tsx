import Image from 'next/image'
import Logo from '../app/icon.png'

/**
 * Header component.
 */
export default function Header() {
  return (
    <header className="flex items-center gap-4" data-testid="header">
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
      <div className="not-prose">
        <h1 className="mb-3 text-3xl font-bold md:text-4xl">
          <a href="/">Greg Rickaby</a>
        </h1>
        <p>Full-Stack Engineer / Photographer / Author</p>
      </div>
    </header>
  )
}
