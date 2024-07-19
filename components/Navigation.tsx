import Link from 'next/link'

/**
 * Navigation component.
 */
export default function Navigation() {
  return (
    <nav className="flex items-center justify-center gap-4 md:justify-start">
      <Link className="underline" href="/blog">
        Blog
      </Link>
      <Link className="underline" href="/contact">
        Contact
      </Link>
      <Link className="underline" href="/cv">
        CV
      </Link>
      <Link className="underline" href="/media">
        Media
      </Link>
      <Link className="underline" href="/resources">
        Resources
      </Link>
    </nav>
  )
}
