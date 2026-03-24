import { NextResponse } from 'next/server'

// This endpoint is no longer used — PayPal payments are handled via
// /api/subscription/create (create order) and /api/subscription/capture (capture + activate)
export async function GET() {
  return NextResponse.redirect(
    new URL('/dashboard/subscription', process.env.NEXTAUTH_URL || 'http://localhost:3000')
  )
}
