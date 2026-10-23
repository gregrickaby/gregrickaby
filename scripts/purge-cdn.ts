/**
 * Purges Cloudflare's cache after a deploy. Cloudflare caches page HTML, and
 * old HTML points at CSS and JS chunks the new build no longer serves. Runs as
 * Coolify's post-deployment command.
 */
const zone = process.env.CLOUDFLARE_ZONE_ID
const token = process.env.CLOUDFLARE_PURGE_TOKEN

if (!zone || !token) {
  console.log('Skipping Cloudflare purge: CLOUDFLARE_ZONE_ID or CLOUDFLARE_PURGE_TOKEN is not set')
  process.exit(0)
}

const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ purge_everything: true }),
})

if (!response.ok) {
  console.error(`Cloudflare purge failed: ${response.status} ${await response.text()}`)
  process.exit(1)
}

console.log('Purged Cloudflare cache')

export {}
