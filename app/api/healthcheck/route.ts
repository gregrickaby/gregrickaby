import {NextResponse} from 'next/server'

/**
 * Health check endpoint for container orchestration.
 *
 * @returns Simple status response indicating the app is running
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'gregrickaby.com'
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    }
  )
}
