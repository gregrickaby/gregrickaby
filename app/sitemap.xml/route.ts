import config from '@/lib/config'
import getPages from '@/lib/queries/getPages'
import getPosts from '@/lib/queries/getPosts'

/**
 * Route segment config.
 *
 * Force static generation of route and revalidate every 5 minutes.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const revalidate = 300

/**
 * Route handler for generating sitemap.xml.
 *
 * @see https://www.sitemaps.org/protocol.html
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route
 */
export async function GET() {
  // Fetch all posts and pages.
  const allPosts = await getPosts()
  const allPages = await getPages()

  // Start sitemap XML.
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

  // Add all pages to sitemap.
  allPages.forEach((page) => {
    xml += `
  <url>
    <loc>${config.siteUrl}/${page.slug}</loc>
    <lastmod>${new Date(page.date).toISOString()}</lastmod>
  </url>`
  })

  // Add blog posts to sitemap.
  allPosts.edges.forEach(({node}) => {
    xml += `
  <url>
    <loc>${config.siteUrl}/blog/${node.slug}</loc>
    <lastmod>${new Date(node.date).toISOString()}</lastmod>
  </url>`
  })

  // Close urlset tag.
  xml += `</urlset>`

  // Return response.
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  })
}
