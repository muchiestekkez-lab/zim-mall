import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // NextAuth v5 renamed the session cookie
  const secureCookie = req.nextUrl.protocol === 'https:'
  const cookieName = secureCookie
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName,
  })

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
    }
    if (token.role !== 'SELLER' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/become-seller', req.url))
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
