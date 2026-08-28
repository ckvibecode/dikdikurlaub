'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSessionMember } from '@/lib/auth'
import { applyPoints } from '@/lib/gamification'
import { getDrinkWindow, DRINK_TRACKING_START_HOUR } from '@/lib/drink-window'

export interface LogDrinkResult {
  error?: string
}

export async function logDrink(categoryId: string): Promise<LogDrinkResult> {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')

  // Autoritative Prüfung: die UI sperrt sich zwar selbst, aber die Action ist die
  // einzige Stelle, die nicht umgangen werden kann.
  if (!getDrinkWindow().open) {
    return { error: `Getränke zählen erst ab ${DRINK_TRACKING_START_HOUR}:00.` }
  }

  const category = await prisma.drinkCategory.findFirst({
    where: { id: categoryId, tripId: member.tripId, isActive: true },
  })
  if (!category) throw new Error('Getränke-Kategorie nicht gefunden')

  await prisma.$transaction(async (tx) => {
    const entry = await tx.drinkEntry.create({
      data: { tripId: member.tripId, memberId: member.id, categoryId: category.id, quantity: 1 },
    })

    await applyPoints(tx, {
      tripId: member.tripId,
      memberId: member.id,
      amount: category.points,
      source: 'DRINK_RANKING',
      sourceId: entry.id,
      reason: `Getränk geloggt (${category.label})`,
    })
  })

  revalidatePath('/home')
  revalidatePath('/drinks')
  revalidatePath('/leaderboard')
  return {}
}

export async function deleteDrink(drinkEntryId: string) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')

  const entry = await prisma.drinkEntry.findFirst({
    where: { id: drinkEntryId, tripId: member.tripId, memberId: member.id },
    include: { category: true },
  })
  if (!entry) return

  await prisma.$transaction(async (tx) => {
    const awardedLedgerEntries = await tx.pointsLedger.findMany({
      where: { sourceId: entry.id, source: 'DRINK_RANKING' },
    })
    const awardedAmount = awardedLedgerEntries.reduce((sum, l) => sum + l.amount, 0)

    if (awardedAmount !== 0) {
      await applyPoints(tx, {
        tripId: member.tripId,
        memberId: member.id,
        amount: -awardedAmount,
        source: 'DRINK_RANKING',
        sourceId: entry.id,
        reason: `Getränk entfernt (${entry.category.label})`,
      })
    }

    await tx.drinkEntry.delete({ where: { id: entry.id } })
  })

  revalidatePath('/home')
  revalidatePath('/drinks')
  revalidatePath('/leaderboard')
}
