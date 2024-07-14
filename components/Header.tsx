import Image from 'next/image'
import Logo from '../app/icon.png'

/**
 * Header component.
 */
export default function Header() {
  return (
    <header className="flex items-center gap-4" data-testid="header">
      <div>
        <Image
          alt="Greg Rickaby"
          className="rounded-full"
          height="120"
          src={Logo}
          width="120"
        />
      </div>
      <div className="not-prose">
        <h1 className="mb-3 text-3xl font-bold md:text-4xl">Greg Rickaby</h1>
        <p>Full-Stack Engineer / Photographer / Author</p>
      </div>
    </header>
  )
}
