import config from '@/lib/config'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '../app/icon.png'

/**
 * Header component.
 */
export default function Header() {
  return (
    <header
      className="flex flex-col items-center justify-center gap-12 text-center md:flex-row md:justify-between"
      data-testid="header"
    >
      <div className="not-prose flex flex-col items-center gap-4 md:flex-row md:text-left">
        <Link href="/">
          <Image
            alt="Greg Rickaby"
            className="mx-auto h-24 w-24 rounded-full shadow-lg"
            height={96}
            loading="eager"
            src={Logo}
            width={96}
          />
        </Link>
        <div className="flex flex-col md:text-left">
          <Link href="/" className="no-underline">
            <h1 className="mb-3 text-4xl font-bold leading-none">
              {config.siteName}
            </h1>
          </Link>
          <p className="m-0 max-w-sm p-0 text-lg">{config.siteDescription}</p>
        </div>
      </div>
    </header>
  )
}
