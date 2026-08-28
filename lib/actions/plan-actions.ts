'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSessionMember } from '@/lib/auth'
import { applyPoints } from '@/lib/gamification'
import { MAX_PLAN_ITEM_POINTS } from '@/lib/plan'

export interface ActionState {
  error?: string
  /** Nach erfolgreichem Anlegen: das Formular schliesst und springt zu dieser Karte. */
  createdId?: string
  createdTitle?: string
}


export async function addPlanItem(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const member = await getSessionMember()
  if (!member) return { error: 'Nicht eingeloggt' }

  const day = String(formData.get('day') ?? '').trim()
  const startTime = String(formData.get('startTime') ?? '').trim()
  const endTime = String(formData.get('endTime') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const pointsRaw = String(formData.get('points') ?? '0').trim()
  const points = pointsRaw === '' ? 0 : Number(pointsRaw)

  if (!day || !title) {
    return { error: 'Tag und Titel sind Pflichtfelder' }
  }

  const dayDate = new Date(day)
  if (Number.isNaN(dayDate.getTime())) {
    return { error: 'Ungültiges Datum' }
  }

  if (!Number.isInteger(points) || points < 0 || points > MAX_PLAN_ITEM_POINTS) {
    return { error: `Punkte müssen eine ganze Zahl zwischen 0 und ${MAX_PLAN_ITEM_POINTS} sein` }
  }

  const maxSort = await prisma.planItem.aggregate({
    where: { tripId: member.tripId, day: dayDate },
    _max: { sortOrder: true },
  })

  const created = await prisma.planItem.create({
    data: {
      tripId: member.tripId,
      day: dayDate,
      startTime: startTime || null,
      endTime: endTime || null,
      title,
      description: description || null,
      points,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      createdByMemberId: member.id,
    },
  })

  revalidatePath('/plan')
  revalidatePath('/home')
  return { createdId: created.id, createdTitle: created.title }
}

/** Bestätigt oder widerruft die eigene Teilnahme an einem Programmpunkt. Bei Bestätigung
 * werden ggf. die vom Ersteller festgelegten Punkte vergeben (und bei Widerruf wieder
 * zurückgenommen), sowie die Streak aktualisiert. */
export async function toggleParticipation(planItemId: string) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')

  const planItem = await prisma.planItem.findFirst({
    where: { id: planItemId, tripId: member.tripId },
  })
  if (!planItem) throw new Error('Programmpunkt nicht gefunden')

  const existing = await prisma.planItemCompletion.findUnique({
    where: { planItemId_memberId: { planItemId, memberId: member.id } },
  })

  if (existing) {
    await prisma.$transaction(async (tx) => {
      if (planItem.points > 0) {
        const awarded = await tx.pointsLedger.findMany({
          where: { sourceId: existing.id, source: 'PLAN_ITEM' },
        })
        const amount = awarded.reduce((sum, l) => sum + l.amount, 0)
        if (amount !== 0) {
          await applyPoints(tx, {
            tripId: member.tripId,
            memberId: member.id,
            amount: -amount,
            source: 'PLAN_ITEM',
            sourceId: existing.id,
            reason: `Teilnahme zurückgezogen (${planItem.title})`,
          })
        }
      }
      await tx.planItemCompletion.delete({ where: { id: existing.id } })
    })
  } else {
    await prisma.$transaction(async (tx) => {
      const completion = await tx.planItemCompletion.create({ data: { planItemId, memberId: member.id } })
      if (planItem.points > 0) {
        await applyPoints(tx, {
          tripId: member.tripId,
          memberId: member.id,
          amount: planItem.points,
          source: 'PLAN_ITEM',
          sourceId: completion.id,
          reason: `Teilnahme bestätigt (${planItem.title})`,
        })
      }
    })
  }

  revalidatePath('/plan')
  revalidatePath('/home')
  revalidatePath('/leaderboard')
}

/** Löscht einen Programmpunkt -- nur der Ersteller darf das. Für jede bereits bestätigte
 * Teilnahme werden zuerst die dafür vergebenen Punkte zurückgenommen. */
export async function deletePlanItem(planItemId: string) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')

  const planItem = await prisma.planItem.findFirst({
    where: { id: planItemId, tripId: member.tripId },
    include: { completions: true },
  })
  if (!planItem) return
  if (planItem.createdByMemberId !== member.id) throw new Error('Nur der Ersteller kann diesen Programmpunkt löschen')

  await prisma.$transaction(async (tx) => {
    if (planItem.points > 0) {
      for (const completion of planItem.completions) {
        const awarded = await tx.pointsLedger.findMany({
          where: { sourceId: completion.id, source: 'PLAN_ITEM' },
        })
        const amount = awarded.reduce((sum, l) => sum + l.amount, 0)
        if (amount !== 0) {
          await applyPoints(tx, {
            tripId: member.tripId,
            memberId: completion.memberId,
            amount: -amount,
            source: 'PLAN_ITEM',
            sourceId: completion.id,
            reason: `Programmpunkt gelöscht (${planItem.title})`,
          })
        }
      }
    }
    await tx.planItemCompletion.deleteMany({ where: { planItemId: planItem.id } })
    await tx.planItem.delete({ where: { id: planItem.id } })
  })

  revalidatePath('/plan')
  revalidatePath('/home')
  revalidatePath('/leaderboard')
}
