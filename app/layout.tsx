import { Footer } from "@/components/Footer";
import { Umami } from "@/components/Umami";
import { getProfileData } from "@/lib/services/dataService";
import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Slab } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const roboto = Roboto({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

const robotoSlab = Roboto_Slab({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-serif",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const data = getProfileData();

  return {
    title: data.profile.siteTitle,
    description: data.profile.bio,
    authors: [{ name: data.profile.name, url: data.profile.url }],
    creator: data.profile.name,
    publisher: data.profile.name,
    keywords: [
      "software engineer",
      "photographer",
      "author",
      data.profile.name,
      data.profile.location,
      data.profile.company.name,
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    metadataBase: new URL(data.profile.url),
    alternates: {
      canonical: data.profile.url,
    },
    openGraph: {
      type: "profile",
      url: data.profile.url,
      title: data.profile.name,
      description: data.profile.bio,
      siteName: data.profile.name,
      locale: "en_US",
      images: [
        {
          url: "/icon.jpg",
          width: 256,
          height: 256,
          alt: data.profile.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.profile.name,
      description: data.profile.bio,
      images: ["/icon.jpg"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = getProfileData();
  const umamiUrl = process.env.UMAMI_URL || "";
  const blogUrl = data.links.find((link) => link.title === "Blog")?.url;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: data.profile.name,
      url: data.profile.url,
      image: `${data.profile.url}/icon.jpg`,
      description: data.profile.bio,
      mainEntityOfPage: blogUrl || "https://blog.gregrickaby.com",
      jobTitle: data.profile.company.role,
      worksFor: {
        "@type": "Organization",
        name: data.profile.company.name,
        url: data.profile.company.url,
      },
      sameAs: data.social.map((s) => s.url),
    },
  };

  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://static.cloudflareinsights.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href={umamiUrl} crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/background.avif" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Umami />
      </head>
      <body
        className={`${roboto.variable} ${robotoSlab.variable} optimize-legibility antialiased`}
      >
        {children}
        <Suspense fallback={null}>
          <Footer {...data} />
        </Suspense>
      </body>
    </html>
  );
}
