import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session-config'

// Guenstiger Cookie-Check (kein DB-Zugriff). Die verbindliche Pruefung inkl. echtem
// Mitglied laeuft zusaetzlich in app/(app)/layout.tsx via getSessionMember().
export async function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  const isAppRoute = request.nextUrl.pathname.startsWith('/home')
    || request.nextUrl.pathname.startsWith('/leaderboard')
    || request.nextUrl.pathname.startsWith('/drinks')
    || request.nextUrl.pathname.startsWith('/plan')
    || request.nextUrl.pathname.startsWith('/strafen')

  if (isAppRoute && (!session.tripId || !session.memberId)) {
    return NextResponse.redirect(new URL('/join', request.url))
  }

  return response
}

export const config = {
  matcher: ['/home/:path*', '/leaderboard/:path*', '/drinks/:path*', '/plan/:path*', '/strafen/:path*'],
}
