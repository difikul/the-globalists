import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user is authenticated by looking for session cookie
  const sessionCookie = request.cookies.get("authjs.session-token") ||
                        request.cookies.get("__Secure-authjs.session-token")
  const isAuth = !!sessionCookie

  const isAuthPage = pathname.startsWith("/auth")
  const isDashboard = pathname.startsWith("/dashboard")

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Protect dashboard routes
  if (isDashboard && !isAuth) {
    let from = pathname
    if (request.nextUrl.search) {
      from += request.nextUrl.search
    }

    return NextResponse.redirect(
      new URL(`/auth/login?from=${encodeURIComponent(from)}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}
