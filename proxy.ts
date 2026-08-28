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
    || request.nextUrl.pathname.startsWith('/admin')

  if (isAppRoute && (!session.tripId || !session.memberId)) {
    return NextResponse.redirect(new URL('/join', request.url))
  }

  return response
}

export const config = {
  // /admin steht hier nur fuer den Cookie-Check. Ob jemand tatsaechlich Admin ist, entscheidet
  // app/(app)/admin/layout.tsx -- und zwar mit 404 statt "kein Zugriff", damit die Route fuer
  // alle anderen gar nicht erst zu existieren scheint.
  matcher: ['/home/:path*', '/leaderboard/:path*', '/drinks/:path*', '/plan/:path*', '/strafen/:path*', '/admin/:path*'],
}
