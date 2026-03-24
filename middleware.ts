import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/dashboard', req.url))
    }
    if (token.role !== 'SELLER' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?error=not_seller', req.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/admin', req.url))
    }
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
