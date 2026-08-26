import 'server-only'
import { cookies } from 'next/headers'
import { getIronSession, type IronSession } from 'iron-session'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { sessionOptions, type SessionData } from '@/lib/session-config'

export type { SessionData }
export { sessionOptions }

/** Nur in Server Components/Actions/Route Handlers aufrufbar (nutzt next/headers cookies()). */
export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}

/** Lädt das eingeloggte Mitglied (inkl. Trip) frisch aus der DB, oder null wenn keine gültige Session/Mitglied. */
export async function getSessionMember() {
  const session = await getSession()
  if (!session.tripId || !session.memberId) return null

  const member = await prisma.member.findFirst({
    where: { id: session.memberId, tripId: session.tripId },
    include: { trip: true },
  })
  return member
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

// Sehr einfaches In-Memory Rate-Limiting gegen PIN-Bruteforce (ausreichend für eine
// kleine Freundesgruppe auf einem einzelnen Server-Prozess, kein Redis nötig).
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 5 * 60 * 1000

export function isRateLimited(key: string): boolean {
  const entry = loginAttempts.get(key)
  if (!entry || entry.resetAt < Date.now()) return false
  return entry.count >= MAX_ATTEMPTS
}

export function recordFailedAttempt(key: string): void {
  const entry = loginAttempts.get(key)
  if (!entry || entry.resetAt < Date.now()) {
    loginAttempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS })
  } else {
    entry.count += 1
  }
}

export function clearAttempts(key: string): void {
  loginAttempts.delete(key)
}
