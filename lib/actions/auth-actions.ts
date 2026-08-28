'use server'

import { redirect } from 'next/navigation'
import { Prisma } from '../../generated/prisma/client.ts'
import { prisma } from '@/lib/db'
import { getSession, hashPin, verifyPin, isRateLimited, recordFailedAttempt, clearAttempts } from '@/lib/auth'
import { joinTripSchema, loginSchema } from '@/lib/validations'
import type { z } from 'zod'

export interface ActionState {
  error?: string
  fieldErrors?: Record<string, string>
  /**
   * React 19 leert das Formular nach jeder Action. Damit ein Fehler nicht die
   * ganze Eingabe vernichtet, spiegeln wir die unkritischen Felder zurueck.
   * PINs bleiben bewusst draussen und werden neu eingegeben.
   */
  values?: { tripCode?: string; name?: string }
}

function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string' && !fieldErrors[field]) {
      fieldErrors[field] = issue.message
    }
  }
  return fieldErrors
}

export async function joinTrip(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const values = {
    tripCode: String(formData.get('tripCode') ?? ''),
    name: String(formData.get('name') ?? ''),
  }

  const parsed = joinTripSchema.safeParse({
    tripCode: formData.get('tripCode'),
    name: formData.get('name'),
    avatar: formData.get('avatar'),
    pin: formData.get('pin'),
    pinConfirm: formData.get('pinConfirm'),
  })

  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values }
  }

  const { tripCode, name, avatar, pin } = parsed.data

  const trip = await prisma.trip.findUnique({ where: { code: tripCode } })
  if (!trip) {
    return {
      fieldErrors: { tripCode: 'Diesen Trip-Code gibt es nicht. Frag nochmal in der Gruppe nach.' },
      values,
    }
  }

  const existing = await prisma.member.findUnique({
    where: { tripId_name: { tripId: trip.id, name } },
  })
  if (existing) {
    return {
      fieldErrors: { name: 'Diesen Namen gibt es hier schon. Nimm einen anderen – oder log dich unten ein.' },
      values,
    }
  }

  const avatarTaken = await prisma.member.findFirst({ where: { tripId: trip.id, avatar } })
  if (avatarTaken) {
    return {
      fieldErrors: { avatar: 'Die Farbe war jemand anderes schneller. Such dir eine andere aus.' },
      values,
    }
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
      return {
        error: 'Name oder Avatar-Farbe wurden gerade eben vergeben. Bitte Seite neu laden und erneut versuchen.',
        values,
      }
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
  const values = {
    tripCode: String(formData.get('tripCode') ?? ''),
    name: String(formData.get('name') ?? ''),
  }

  const parsed = loginSchema.safeParse({
    tripCode: formData.get('tripCode'),
    name: formData.get('name'),
    pin: formData.get('pin'),
  })

  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values }
  }

  const { tripCode, name, pin } = parsed.data
  const rateLimitKey = `${tripCode}:${name}`

  if (isRateLimited(rateLimitKey)) {
    return { error: 'Zu viele Fehlversuche. Bitte warte ein paar Minuten und versuch es erneut.', values }
  }

  // Bewusst unspezifisch: sonst verraet die Fehlermeldung, welche Namen es im Trip gibt.
  const genericError = { error: 'Trip-Code, Name oder PIN falsch.', values }

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
