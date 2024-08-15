import { authMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: ['/site', '/api/uploadthing'],
  async beforeAuth(auth, req) {},
  async afterAuth(auth, req) {
    //rewrite for domains
    const url = req.nextUrl
    const searchParams = url.searchParams.toString()
    let hostname = req.headers

    const pathWithSearchParams = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ''
    }`

    //if subdomain exists
    const customSubDomain = hostname
      .get('host')
      ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
      .filter(Boolean)[0]

    if (customSubDomain) {
      return NextResponse.rewrite(
        new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
      )
    }

    if (url.pathname === '/inscription' || url.pathname === '/connexion') {
      return NextResponse.redirect(new URL(`/organisation/inscription`, req.url))
    }

    if (
      url.pathname === '/' ||
      (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
    ) {
      return NextResponse.rewrite(new URL('/site', req.url))
    }

    if (
      url.pathname.startsWith('/organisation') ||
      url.pathname.startsWith('/sous-compte')
    ) {
      return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url))
    }
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
