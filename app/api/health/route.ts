import { connection } from 'next/server'

/**
 * Coolify's container health check. `connection()` makes it run per request,
 * so a passing check means the server executed route code, not that it served
 * a file prerendered at build time. It does no other work.
 */
export async function GET() {
  await connection()
  return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
}
