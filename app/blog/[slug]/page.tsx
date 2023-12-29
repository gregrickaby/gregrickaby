import SinglePost from '@/components/SinglePost'
import config from '@/lib/config'
import {rssFeedRedirect} from '@/lib/functions'
import getPostBySlug from '@/lib/queries/getPostBySlug'
import getPosts from '@/lib/queries/getPosts'
import {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'

/**
 * Generate the static routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Get all blog posts.
  const posts = await getPosts(1000)

  // No posts? Bail...
  if (!posts.edges.length) {
    return []
  }

  // Return the slugs for each post.
  return posts.edges.map(({node}) => ({
    slug: node.slug
  }))
}

interface GenerateMetadataProps {
  params: {slug: string}
  searchParams: {[key: string]: string | string[] | undefined}
}

/**
 * Generate the metadata for each static route at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(
  {params, searchParams}: GenerateMetadataProps,
  parent: ResolvingMetadata
): Promise<Metadata | null> {
  // Get the blog post.
  const post = await getPostBySlug(params.slug)

  // No post? Bail...
  if (!post) {
    return {}
  }

  return {
    title: post.seo.title,
    description: post.seo.metaDesc,
    openGraph: {
      title: post.seo.title,
      description: post.seo.metaDesc,
      url: `${config.siteUrl}/blog/${params.slug}`,
      siteName: config.siteName,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: post?.featuredImage?.node?.sourceUrl,
          width: post?.featuredImage?.node?.mediaDetails?.width,
          height: post?.featuredImage?.node?.mediaDetails?.height,
          alt: post?.featuredImage?.node?.altText
        }
      ]
    }
  }
}

/**
 * Single blog post route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Post({params}: {params: {slug: string}}) {
  // Maybe redirect to the RSS feed.
  rssFeedRedirect(params.slug)

  // Fetch a single post from WordPress.
  const post = await getPostBySlug(params.slug)

  // No post? Throw a 404.
  if (!post) {
    notFound()
  }

  return <SinglePost post={post} />
}
