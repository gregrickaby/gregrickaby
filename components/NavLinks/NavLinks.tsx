import {AppLink} from '@/components/AppLink/AppLink'
import {siteConfig} from '@/lib/config'
import classes from './NavLinks.module.css'

interface NavLinksProps {
  onClick?: () => void
  size?: string
}

export function NavLinks({onClick, size = 'md'}: Readonly<NavLinksProps>) {
  return (
    <>
      {siteConfig.nav.map((link) => (
        <AppLink
          key={link.href}
          href={link.href}
          className={classes.navLink}
          style={{fontSize: `var(--mantine-font-size-${size})`}}
          onClick={onClick}
        >
          {link.label}
        </AppLink>
      ))}
    </>
  )
}
