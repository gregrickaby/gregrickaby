import config from '@/lib/config'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '../app/icon.png'
import Navigation from './Navigation'

/**
 * Header component.
 */
export default function Header() {
  return (
    <header
      className="mb-16 flex items-center justify-between gap-12 p-8 text-center md:flex-row md:justify-between md:p-12"
      data-testid="header"
    >
      <div className="flex flex-row items-center gap-4 lg:flex-row lg:text-left">
        <Link href="/">
          <Image
            alt="Greg Rickaby"
            className="mx-auto rounded-full shadow-lg"
            height={96}
            loading="eager"
            src={Logo}
            width={96}
          />
        </Link>
        <div className="flex flex-col text-left">
          <Link href="/" className="no-underline">
            <h1 className="mb-1 text-2xl font-bold leading-none tracking-tighter md:text-4xl">
              {config.siteName}
            </h1>
          </Link>
          <p className="m-0 max-w-sm p-0 md:ml-1 md:text-lg">
            {config.siteDescription}
          </p>
        </div>
      </div>
      <Navigation />
    </header>
  )
}
