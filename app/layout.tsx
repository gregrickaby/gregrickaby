import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Meta from '@/components/JsonLd'
import SerachProvder from '@/components/SearchProvider'
import config from '@/lib/config'
import type {Metadata, Viewport} from 'next'
import dynamic from 'next/dynamic'
import {Fira_Sans} from 'next/font/google'
import './globals.css'

/**
 * Setup dynamic imports.
 *
 * @see https://nextjs.org/docs/advanced-features/dynamic-import
 */
const Search = dynamic(() => import('@/components/Search'), {
  ssr: false
})

/**
 * Setup Google Font.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/fonts#google-fonts
 */
const googleFont = Fira_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700']
})

/**
 * Setup metadata.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#basic-fields
 */
export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: `${config.siteName} - ${config.siteDescription}`,
  description: config.intro,
  robots: 'follow, index',
  alternates: {
    canonical: config.siteUrl,
    types: {
      'application/rss+xml': `${config.siteUrl}/feed.xml`
    }
  },
  icons: {
    icon: '/icons/apple-icon.png',
    shortcut: '/icons/apple-icon.png',
    apple: '/icons/apple-touch-icon.png',
    other: {
      rel: 'apple-icon-precomposed',
      url: '/icons/apple-icon-precomposed.png'
    }
  },
  openGraph: {
    title: config.siteName,
    description: config.intro,
    url: config.siteUrl,
    siteName: config.siteName,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: config.siteOgImage,
        width: 1175,
        height: 882,
        alt: config.siteName
      }
    ]
  },
  manifest: '/manifest.json'
}

/**
 * Setup viewport.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-viewport#the-viewport-object
 */
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#18181b'
}

/**
 * Root layout component.
 */
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${googleFont.className}`}>
        <SerachProvder>
          <Meta />
          <Header />
          <main>{children}</main>
          <Footer />
          <Search />
        </SerachProvder>
      </body>
    </html>
  )
}
