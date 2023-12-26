'use client'

import {useSearch} from '@/components/SearchProvider'
import config from '@/lib/config'
import Image from 'next/image'
import Link from 'next/link'
import {FaMagnifyingGlass} from 'react-icons/fa6'

/**
 * Header component.
 */
export default function Header() {
  const {toggleSearch, setToggleSearch} = useSearch()

  return (
    <header className="flex flex-col items-center justify-center gap-12 pb-12 text-center md:flex-row md:justify-between">
      <div className="flex flex-col items-center gap-4 md:flex-row md:text-left">
        <Link href="/">
          <Image
            alt="Greg Rickaby"
            className="mx-auto h-24 w-24 rounded-full shadow-lg"
            height={96}
            loading="eager"
            src={config.siteLogo}
            width={96}
          />
        </Link>
        <div className="flex flex-col md:text-left">
          <Link href="/">
            <h1 className="mb-3 text-4xl font-bold leading-none">
              {config.siteName}
            </h1>
          </Link>
          <p className="m-0 max-w-sm p-0 text-lg">{config.siteDescription}</p>
        </div>
      </div>
      <nav className="flex items-center justify-center gap-8 text-center text-xl">
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/feed.xml">RSS</Link>
        <button
          aria-label="Search"
          className="rounded bg-transparent p-2 transition-all duration-300 ease-in-out hover:bg-zinc-200 dark:text-white dark:hover:bg-zinc-700"
          onClick={() => setToggleSearch(!toggleSearch)}
        >
          <FaMagnifyingGlass />
        </button>
      </nav>
    </header>
  )
}
