import Background from '@/app/components/Background'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import Meta from '@/app/components/JsonLd'
import {PreloadResources} from '@/app/components/PreloadResources'
import config from '@/app/lib/config'
import type {Metadata, Viewport} from 'next'
import {Fira_Sans} from 'next/font/google'
import './globals.css'

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
  title: config.siteName,
  description: config.siteDescription,
  robots: 'follow, index',
  alternates: {
    canonical: config.siteUrl
  },
  openGraph: {
    title: config.siteName,
    description: config.siteDescription,
    url: config.siteUrl,
    siteName: config.siteName,
    images: [
      {
        url: config.siteOgImage,
        width: 1175,
        height: 882
      }
    ],
    locale: 'en_US',
    type: 'website'
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
  themeColor: '#111111'
}

/**
 * Root layout component.
 */
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <PreloadResources />
      <body className={`${googleFont.className}`}>
        <Meta />
        <div className="relative h-screen w-screen">
          <Background />
          <div className="absolute inset-0 mx-auto space-y-8 p-12">
            <Header />
            {children}
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}
