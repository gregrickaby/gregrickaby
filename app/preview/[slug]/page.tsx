import Blocks from '@/components/Blocks'
import FeaturedImage from '@/components/FeaturedImage'
import {formatDate, seoHandler} from '@/lib/functions'
import getPreview from '@/lib/queries/getPreview'
import {Metadata} from 'next'

// Types.
interface PreviewProps {
  params: {slug: string}
  searchParams: {[key: string]: string | string[] | undefined}
}

/**
 * Route segment config.
 *
 * Because previews are dynamic, force the route to be dynamic.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

/**
 * Generate the metadata for this preview.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({
  params
}: {
  params: {slug: string}
}): Promise<Metadata | null> {
  // Get the preview.
  const post = await getPreview(params.slug)

  // No preview? Bail.
  if (!post) {
    return {}
  }

  return seoHandler(post)
}

/**
 * Preview route.
 *
 * This route is used to preview posts before they are published.
 * It must contain the secret key in the query parameters.
 *
 * @usage https://example.com/preview/123456?secret=secret-key
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Preview({params, searchParams}: PreviewProps) {
  // Get the secret from the query parameters.
  const secret = searchParams.secret

  // No secret? Bail.
  if (!secret || secret !== process.env.NEXTJS_PREVIEW_SECRET) {
    return (
      <div className="container mx-auto text-center">
        <h1>This page requires a preview secret.</h1>
        <p>
          Please verify the secret has been set in both the environment variable
          (.env) and wp-config.php files and the secret is passed as a query
          parameter.
        </p>
      </div>
    )
  }

  // Attempt to get the preview.
  const post = await getPreview(params.slug)

  // No preview available? Bail.
  if (!post) {
    return (
      <div className="container mx-auto text-center">
        <h1>Preview Error</h1>
        <p>
          Couldn&apos;t find a WordPress post with the Post ID:{' '}
          <span className="bg-yellow-200 p-1 font-mono text-black">
            {params.slug}
          </span>
        </p>
        <p>Please verify the Post ID and try again.</p>
      </div>
    )
  }

  return (
    <article>
      <header>
        <h1
          className="m-0 p-0 leading-none"
          dangerouslySetInnerHTML={{__html: post.title}}
        />
        <FeaturedImage
          image={post.featuredImage}
          hidden={post.hideFeaturedImage.hideFeaturedImage}
        />
        <p className="mt-4 italic">
          By {post.author.node.name} on{' '}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
      </header>
      <Blocks content={post.content} />
      <footer className="flex items-center justify-between gap-4 pb-4">
        <div>
          <h3>Categories</h3>
          <ul className="m-0 flex list-none gap-2 p-0">
            {post.categories.nodes.map((category) => (
              <li className="m-0 p-0" key={category.databaseId}>
                {category.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Tags</h3>
          <ul className="m-0 flex list-none gap-2 p-0">
            {post.tags.nodes.map((tag) => (
              <li className="m-0 p-0" key={tag.databaseId}>
                {tag.name}
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </article>
  )
}
