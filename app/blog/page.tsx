import { BlogPostCard } from "@/components/BlogPostCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles about photography, development, and technology.",
};

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Blog</h1>
      <div className="space-y-8">
        <BlogPostCard
          title="Brightening the Frame: How Gain Maps Elevate HDR Photography"
          slug="how-gain-maps-elevate-hdr-photography"
          date="October 27, 2023"
          description="Explore the vibrant world of High Dynamic Range (HDR) photography enhanced by Gain Maps. Learn how modern HDR photography captures a wider range of brightness, contrast, and colors than Standard Dynamic Range."
        />
      </div>
    </main>
  );
}
