import Footer from '@/components/Footer'
import Header from '@/components/Header'
import JsonLD from '@/components/JsonLd'
import config from '@/lib/config'
import type {Metadata, Viewport} from 'next'
import {Aleo} from 'next/font/google'
import './globals.css'

const aleo = Aleo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-aleo'
})

/**
 * Setup default sitewide metadata.
 *
 * Note: Much of this is overridden by the metadata returned
 * from the `generateMetadata()` function on individual routes.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#basic-fields
 */
export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: `${config.siteName} - ${config.siteDescription}`,
  description: config.siteDescription,
  robots: {
    follow: true,
    index: true
  },
  alternates: {
    canonical: config.siteUrl,
    types: {
      'application/rss+xml': `${config.siteUrl}/feed.xml`
    }
  },
  openGraph: {
    title: config.siteName,
    description: config.siteDescription,
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
  manifest: '/manifest.webmanifest'
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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${aleo.variable}`}>
      <body className="prose m-auto space-y-8 p-8 antialiased lg:prose-xl dark:prose-invert dark:bg-zinc-900">
        <JsonLD />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
