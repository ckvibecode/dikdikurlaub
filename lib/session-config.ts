import type { SessionOptions } from 'iron-session'

export interface SessionData {
  tripId?: string
  memberId?: string
}

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET muss gesetzt sein und mindestens 32 Zeichen haben (siehe .env.example)')
}

export const sessionOptions: SessionOptions = {
  cookieName: 'trip_session',
  password: sessionSecret,
  ttl: 60 * 60 * 24 * 30, // 30 Tage
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}
