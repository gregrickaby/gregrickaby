/** Coolify's container health check. It does no work, so frequent checks cost nothing. */
export function GET() {
  return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
}
