import Link from "next/link";
import type { BlogPostCardProps } from "./BlogPostCard.types";

export function BlogPostCard({
  title,
  slug,
  date,
  description,
}: BlogPostCardProps) {
  return (
    <article className="card card-border bg-base-100 shadow-sm">
      <div className="card-body">
        <time className="text-base-content/60 text-sm">{date}</time>
        <h2 className="card-title">
          <Link
            href={`/blog/${slug}`}
            className="hover:text-primary transition-colors"
            data-umami-event={`click-blog-post-${slug}`}
          >
            {title}
          </Link>
        </h2>
        <p className="text-base-content/80">{description}</p>
      </div>
    </article>
  );
}
