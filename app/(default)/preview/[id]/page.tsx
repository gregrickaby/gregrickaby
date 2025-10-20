import {Blocks} from '@/components/Blocks/Blocks'
import {sanitizeText} from '@/lib/functions/sanitizeText'
import {yoastSeo} from '@/lib/functions/yoastSeo'
import type {Metadata} from 'next'

/**
 * Preview props.
 */
interface PreviewProps {
  params: Promise<{id: string}>
  searchParams: Promise<{[key: string]: string | string[] | undefined}>
}

/**
 * Route segment config.
 *
 * Because previews are dynamic, force the route to be dynamic.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const dynamic = 'force-dynamic'

/**
 * Get the preview.
 *
 * @param postId The post ID.
 */
async function getPreview(postId: string) {
  try {
    // Get the API URL.
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL

    // No API URL? Bail.
    if (!apiUrl) {
      throw new Error('WordPress API URL is required.')
    }

    // Fetch the preview.
    const response = await fetch(`${apiUrl}/posts/${postId}?preview=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Bail if the response is not OK.
    if (!response.ok) {
      throw new Error(`Failed to fetch preview: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error(error)
    return null
  }
}

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(
  props: Readonly<PreviewProps>
): Promise<Metadata> {
  const params = await props.params
  const page = await getPreview(params.id)
  return yoastSeo(page)
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
export default async function Preview({
  params,
  searchParams
}: Readonly<PreviewProps>) {
  // Get the secret and post ID.
  const {secret} = await searchParams
  const {id} = await params

  // No secret? Bail.
  if (!secret || secret !== process.env.PREVIEW_SECRET) {
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
  const post = await getPreview(id)

  // No preview available? Bail.
  if (!post) {
    return (
      <div className="container mx-auto text-center">
        <h1>Preview Error</h1>
        <p>
          Couldn&apos;t find a WordPress post with the Post ID:{' '}
          <span className="bg-yellow-200 p-1 font-mono text-black">{id}</span>
        </p>
        <p>Please verify the Post ID and try again.</p>
      </div>
    )
  }

  return (
    <article className="article">
      <header>
        <h1>{sanitizeText(post.title.rendered)}</h1>
      </header>
      <Blocks content={post.content.rendered} />
    </article>
  )
}
