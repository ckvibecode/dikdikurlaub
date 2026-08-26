'use server'

import { redirect } from 'next/navigation'
import { Prisma } from '../../generated/prisma/client.ts'
import { prisma } from '@/lib/db'
import { getSession, hashPin, verifyPin, isRateLimited, recordFailedAttempt, clearAttempts } from '@/lib/auth'
import { joinTripSchema, loginSchema } from '@/lib/validations'

export interface ActionState {
  error?: string
}

export async function joinTrip(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = joinTripSchema.safeParse({
    tripCode: formData.get('tripCode'),
    name: formData.get('name'),
    avatar: formData.get('avatar'),
    pin: formData.get('pin'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe' }
  }

  const { tripCode, name, avatar, pin } = parsed.data

  const trip = await prisma.trip.findUnique({ where: { code: tripCode } })
  if (!trip) {
    return { error: 'Trip-Code nicht gefunden' }
  }

  const existing = await prisma.member.findUnique({
    where: { tripId_name: { tripId: trip.id, name } },
  })
  if (existing) {
    return { error: 'Dieser Name ist in diesem Trip schon vergeben. Nutze "Einloggen" stattdessen.' }
  }

  const avatarTaken = await prisma.member.findFirst({ where: { tripId: trip.id, avatar } })
  if (avatarTaken) {
    return { error: 'Diese Avatar-Farbe ist gerade eben von jemand anderem gewählt worden. Bitte eine andere wählen.' }
  }

  const memberCount = await prisma.member.count({ where: { tripId: trip.id } })
  const pinHash = await hashPin(pin)

  let member
  try {
    member = await prisma.member.create({
      data: {
        tripId: trip.id,
        name,
        avatar,
        pinHash,
        role: memberCount === 0 ? 'ADMIN' : 'MEMBER',
      },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: 'Name oder Avatar-Farbe wurden gerade eben vergeben. Bitte Seite neu laden und erneut versuchen.' }
    }
    throw err
  }

  const session = await getSession()
  session.tripId = trip.id
  session.memberId = member.id
  await session.save()

  redirect('/home')
}

export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    tripCode: formData.get('tripCode'),
    name: formData.get('name'),
    pin: formData.get('pin'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe' }
  }

  const { tripCode, name, pin } = parsed.data
  const rateLimitKey = `${tripCode}:${name}`

  if (isRateLimited(rateLimitKey)) {
    return { error: 'Zu viele Fehlversuche. Bitte warte ein paar Minuten und versuch es erneut.' }
  }

  const genericError = { error: 'Trip-Code, Name oder PIN falsch.' }

  const trip = await prisma.trip.findUnique({ where: { code: tripCode } })
  if (!trip) {
    recordFailedAttempt(rateLimitKey)
    return genericError
  }

  const member = await prisma.member.findUnique({
    where: { tripId_name: { tripId: trip.id, name } },
  })
  if (!member) {
    recordFailedAttempt(rateLimitKey)
    return genericError
  }

  const valid = await verifyPin(pin, member.pinHash)
  if (!valid) {
    recordFailedAttempt(rateLimitKey)
    return genericError
  }

  clearAttempts(rateLimitKey)

  const session = await getSession()
  session.tripId = trip.id
  session.memberId = member.id
  await session.save()

  redirect('/home')
}

export async function logout(): Promise<void> {
  const session = await getSession()
  session.destroy()
  redirect('/join')
}
