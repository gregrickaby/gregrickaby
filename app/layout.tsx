import type { Metadata } from "next";
import { Roboto, Roboto_Slab } from "next/font/google";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { BackgroundImage } from "@/components/BackgroundImage";
import { getProfileData } from "@/lib/services/dataService";
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

export async function generateMetadata(): Promise<Metadata> {
  const data = getProfileData();

  return {
    title: data.profile.name,
    description: data.profile.bio,
    authors: [{ name: data.profile.name, url: data.profile.url }],
    creator: data.profile.name,
    publisher: data.profile.name,
    metadataBase: new URL(data.profile.url),
    openGraph: {
      type: "profile",
      url: data.profile.url,
      title: data.profile.name,
      description: data.profile.bio,
      siteName: data.profile.name,
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
      card: "summary",
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
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'luxury';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className={`${roboto.variable} ${robotoSlab.variable} antialiased`}>
        <div className="fixed inset-0 -z-10">
          <BackgroundImage />
        </div>
        <ThemeSwitcher />
        {children}
      </body>
    </html>
  );
}
