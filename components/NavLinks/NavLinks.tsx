import {AppLink} from '@/components/AppLink/AppLink'
import {siteConfig} from '@/lib/config'
import classes from './NavLinks.module.css'

interface NavLinksProps {
  onClick?: () => void
}

export function NavLinks({onClick}: Readonly<NavLinksProps>) {
  return (
    <>
      {siteConfig.nav.map((link) => (
        <AppLink
          className={classes.navLink}
          href={link.href}
          key={link.href}
          onClick={onClick}
        >
          {link.label}
        </AppLink>
      ))}
    </>
  )
}
