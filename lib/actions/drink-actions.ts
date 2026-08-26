'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSessionMember } from '@/lib/auth'
import { applyPoints } from '@/lib/gamification'

export async function logDrink(categoryId: string) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')

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

// ---- Admin: Getränke-Kategorien verwalten ----

export interface ActionState {
  error?: string
}

export async function addDrinkCategory(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const member = await getSessionMember()
  if (!member) return { error: 'Nicht eingeloggt' }
  if (member.role !== 'ADMIN') return { error: 'Nur der Admin kann Kategorien anlegen' }

  const label = String(formData.get('label') ?? '').trim()
  const pointsRaw = String(formData.get('points') ?? '').trim()
  const points = Number(pointsRaw)

  if (!label) return { error: 'Bitte einen Namen angeben' }
  if (!Number.isInteger(points) || points < 0 || points > 20) {
    return { error: 'Punkte müssen eine ganze Zahl zwischen 0 und 20 sein' }
  }

  const existing = await prisma.drinkCategory.findUnique({
    where: { tripId_label: { tripId: member.tripId, label } },
  })
  if (existing) {
    if (existing.isActive) return { error: 'Diese Kategorie gibt es schon' }
    await prisma.drinkCategory.update({ where: { id: existing.id }, data: { isActive: true, points } })
  } else {
    const maxSort = await prisma.drinkCategory.aggregate({
      where: { tripId: member.tripId },
      _max: { sortOrder: true },
    })
    await prisma.drinkCategory.create({
      data: { tripId: member.tripId, label, points, isDefault: false, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
    })
  }

  revalidatePath('/drinks')
  return {}
}

export async function deleteDrinkCategory(categoryId: string) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')
  if (member.role !== 'ADMIN') throw new Error('Nur der Admin kann Kategorien entfernen')

  const category = await prisma.drinkCategory.findFirst({
    where: { id: categoryId, tripId: member.tripId },
  })
  if (!category || category.isDefault) return

  // Soft-delete: bestehende Getränke-Einträge/Punkte-Historie bleiben unangetastet, die
  // Kategorie verschwindet nur aus der Auswahl.
  await prisma.drinkCategory.update({ where: { id: category.id }, data: { isActive: false } })

  revalidatePath('/drinks')
}
