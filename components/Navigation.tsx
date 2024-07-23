import config from '@/lib/config'
import Link from 'next/link'

/**
 * Navigation component.
 */
export default function Navigation() {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-4 md:justify-start"
      data-testid="nav"
    >
      {config.navigation.map((item) => (
        <Link className="underline" key={item.name} href={item.url}>
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
