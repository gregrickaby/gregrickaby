import './styles/layers.css'
import './styles/reset.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/prose.css'
import './styles/utilities.css'

import type { Metadata, Viewport } from 'next'
import { Roboto, Roboto_Mono, Roboto_Slab } from 'next/font/google'
import { JsonLd } from '@/components/json-ld'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { buildWebSiteGraph } from '@/lib/schema'
import { SITE } from '@/lib/site'
import styles from './layout.module.css'

const sans = Roboto({ subsets: ['latin'], variable: '--font-roboto', display: 'swap' })
const serif = Roboto_Slab({ subsets: ['latin'], variable: '--font-roboto-slab', display: 'swap' })
const mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono', display: 'swap' })

/*
 * Applies the saved theme before first paint without reading cookies on the
 * server, which would make every route dynamic. The regex accepts only known
 * values, so the cookie can't inject anything.
 */
const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}})()`

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} - ${SITE.description}`,
    template: `%s - ${SITE.name}`,
  },
  description: SITE.description,
  authors: [{ name: SITE.author.name, url: SITE.author.url }],
  robots: { index: true, follow: true },
  openGraph: {
    description: SITE.description,
    locale: 'en_US',
    images: [{ url: `${SITE.url}/og-image.jpg`, width: 1200, height: 630, alt: SITE.name }],
    siteName: SITE.name,
    title: SITE.name,
    type: 'website',
    url: SITE.url,
  },
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#242424' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
      data-theme="system"
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <JsonLd graph={buildWebSiteGraph()} />
      </head>
      <body>
        <a className={styles.skip} href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main className={styles.main} id="main">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
