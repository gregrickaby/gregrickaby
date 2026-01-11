import avatar from "@/app/icon.jpg";
import { getProfileData } from "@/lib/services/dataService";
import Image from "next/image";
import Link from "next/link";

export default function BlogLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const data = getProfileData();

  return (
    <>
      <header>
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            aria-label="Go to homepage"
            data-umami-event="click-blog-nav-home-logo"
          >
            <div className="avatar">
              <Image
                alt={data.profile.name}
                className="w-12 rounded-full shadow-md"
                height={48}
                src={avatar}
                width={48}
              />
            </div>
            <span className="text-xl font-semibold">{data.profile.name}</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="hover:text-primary transition-colors"
              aria-label="Go to homepage"
              data-umami-event="click-blog-nav-home"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="hover:text-primary transition-colors"
              aria-label="Go to blog"
              data-umami-event="click-blog-nav-blog"
            >
              Blog
            </Link>
          </div>
        </nav>
      </header>

      {children}
    </>
  );
}
