import Link from 'next/link'

import { NAV } from '@/lib/site'

/** The header links, shared by the desktop bar and the mobile menu. */
export function NavLinks({ className }: { className: string }) {
  return NAV.map((link) =>
    link.external ? (
      <a className={className} href={link.href} key={link.href} rel="noopener" target="_blank">
        {link.label}
      </a>
    ) : (
      <Link className={className} href={link.href} key={link.href}>
        {link.label}
      </Link>
    ),
  )
}
