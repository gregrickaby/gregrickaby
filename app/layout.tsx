import './styles/layers.css'
import './styles/reset.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/prose.css'
import './styles/motion.css'
import './styles/utilities.css'

import type { Metadata, Viewport } from 'next'
import { Roboto, Roboto_Mono, Roboto_Slab, Silkscreen } from 'next/font/google'

import { JsonLd } from '@/components/json-ld'
import { OPEN_GRAPH_BASE } from '@/lib/metadata'
import { buildWebSiteGraph } from '@/lib/schema'
import { SITE } from '@/lib/site'

const sans = Roboto({ subsets: ['latin'], variable: '--font-roboto', display: 'swap' })
const serif = Roboto_Slab({ subsets: ['latin'], variable: '--font-roboto-slab', display: 'swap' })
const mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono', display: 'swap' })
const pixel = Silkscreen({
  subsets: ['latin'],
  variable: '--font-silkscreen',
  weight: '400',
  display: 'swap',
})

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
    ...OPEN_GRAPH_BASE,
    description: SITE.description,
    title: SITE.name,
    url: SITE.url,
  },
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
  // The image comes from app/opengraph-image.tsx; X falls back to it.
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f4' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1c1a' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      className={`${sans.variable} ${serif.variable} ${mono.variable} ${pixel.variable}`}
      data-scroll-behavior="smooth"
      data-theme="system"
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <JsonLd graph={buildWebSiteGraph()} />
      </head>
      <body>{children}</body>
    </html>
  )
}
