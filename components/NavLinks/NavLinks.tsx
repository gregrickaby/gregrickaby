import {AppLink} from '@/components/AppLink/AppLink'
import {siteConfig} from '@/lib/config'
import classes from './NavLinks.module.css'

/**
 * Props for the NavLinks component.
 *
 * @interface
 */
interface NavLinksProps {
  /** Optional. Callback to invoke when a link is clicked (useful for closing mobile menus). */
  onClick?: () => void
}

/**
 * Navigation links component rendering links from the site config.
 * Optionally accepts an onClick handler for closing menus on mobile.
 *
 * @param props - The props for the NavLinks component.
 * @returns A React element containing navigation links.
 */
export function NavLinks({onClick}: Readonly<NavLinksProps>) {
  return (
    <>
      {siteConfig.nav.map((link) => (
        <AppLink
          className={classes.navLink}
          href={link.href}
          key={link.href}
          onClick={onClick}
          {...('external' in link && link.external
            ? {target: '_blank', rel: 'noopener noreferrer'}
            : {})}
        >
          {link.label}
        </AppLink>
      ))}
    </>
  )
}
