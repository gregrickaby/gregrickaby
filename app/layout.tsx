import {cssVariablesResolver, theme} from '@/app/theme'
import {Footer} from '@/components/Footer/Footer'
import {Header} from '@/components/Header/Header'
import {ScrollToTop} from '@/components/ScrollToTop/ScrollToTop'
import {Search} from '@/components/Search/Search'
import {siteConfig} from '@/lib/config'
import {getAllPosts} from '@/lib/content'
import {buildWebSiteGraph, serializeSchema} from '@/lib/schema'
import {
  ColorSchemeScript,
  Container,
  mantineHtmlProps,
  MantineProvider
} from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/spotlight/styles.css'
import {Viewport} from 'next'
import {Roboto, Roboto_Mono, Roboto_Slab} from 'next/font/google'

/**
 * Metadata configuration for the entire site. This will be used as the default metadata for all pages, but can be overridden on a per-page basis by exporting a `metadata` object from the page component.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#the-metadata-object
 */
export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.description}`,
    template: `%s - ${siteConfig.name}`
  },
  description: siteConfig.description,
  robots: {
    index: true,
    follow: true,
    nocache: false
  },
  openGraph: {
    description: siteConfig.description,
    locale: 'en_US',
    images: [
      {
        url: `${siteConfig.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteConfig.name
      }
    ],
    siteName: siteConfig.name,
    title: siteConfig.name,
    type: 'website',
    url: siteConfig.url
  },
  alternates: {
    canonical: siteConfig.url,
    types: {
      'application/rss+xml': '/feed.xml'
    }
  }
}

/**
 * Setup viewport.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-viewport#the-viewport-object
 */
export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#242424'
}

/**
 * Setup global fonts.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-font#the-font-object
 */
const sans = Roboto({
  subsets: ['latin'],
  variable: '--font-sans'
})

const serif = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-serif'
})

const mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const posts = getAllPosts()
  const webSiteGraph = buildWebSiteGraph()

  return (
    <html
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
      lang="en"
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{__html: serializeSchema(webSiteGraph)}}
          type="application/ld+json"
        />
      </head>
      <body>
        <MantineProvider
          cssVariablesResolver={cssVariablesResolver}
          defaultColorScheme="auto"
          theme={theme}
        >
          <Header />
          <Search posts={posts} />
          <Container py="xl" component="main">
            {children}
          </Container>
          <ScrollToTop />
          <Footer />
        </MantineProvider>
      </body>
    </html>
  )
}
