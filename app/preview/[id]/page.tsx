interface PreviewProps {
  params: {id: string}
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

async function getPreview(postId: number) {
  const token = process.env.WORDPRESS_JWT_TOKEN
  const response = await fetch(
    `https://blog.gregrickaby.com/wp-json/wp/v2/posts/${postId}?preview=true`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch preview: ${response.statusText}`)
  }

  return response.json()
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
  // Get the secret from the query parameters.
  const secret = searchParams.secret
  const id = params.id

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
          <span className="bg-yellow-200 p-1 font-mono text-black">
            {params.id}
          </span>
        </p>
        <p>Please verify the Post ID and try again.</p>
      </div>
    )
  }

  return (
    <>
      <h1>Preview</h1>
      <pre>{JSON.stringify(post, null, 2)}</pre>
    </>
  )
}
