import { auth } from './lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  const userRole = session?.user?.role

  // Protect dashboard routes - require SELLER or ADMIN role
  if (nextUrl.pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/dashboard', nextUrl))
    }

    if (userRole !== 'SELLER' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?error=not_seller', nextUrl))
    }
  }

  // Protect admin routes - require ADMIN role
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/admin', nextUrl))
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?error=unauthorized', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
