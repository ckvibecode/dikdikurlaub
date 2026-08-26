'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSessionMember } from '@/lib/auth'
import { applyPoints } from '@/lib/gamification'
import { MIN_VOTES_TO_APPROVE } from '@/lib/penalties'

export interface ActionState {
  error?: string
}

// ---- Katalog-Strafe eintragen (jeder kann jedem eine bestehende Katalog-Strafe zuweisen) ----

export async function logCatalogPenalty(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const member = await getSessionMember()
  if (!member) return { error: 'Nicht eingeloggt' }

  const targetMemberId = String(formData.get('targetMemberId') ?? '')
  const penaltyTypeId = String(formData.get('penaltyTypeId') ?? '')
  if (!targetMemberId || !penaltyTypeId) return { error: 'Bitte Person und Strafe auswählen' }

  const [target, penaltyType] = await Promise.all([
    prisma.member.findFirst({ where: { id: targetMemberId, tripId: member.tripId } }),
    prisma.penaltyType.findFirst({ where: { id: penaltyTypeId, tripId: member.tripId, isActive: true } }),
  ])
  if (!target || !penaltyType) return { error: 'Person oder Strafe nicht gefunden' }

  await prisma.penaltyEntry.create({
    data: {
      tripId: member.tripId,
      penaltyTypeId,
      targetMemberId,
      proposedByMemberId: member.id,
      status: 'PENDING_TARGET',
      points: penaltyType.points,
    },
  })

  revalidatePath('/strafen')
  revalidatePath('/home')
  return {}
}

// ---- Spontane Strafe vorschlagen (Gruppen-Voting) ----

export async function proposeSpontaneousPenalty(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const member = await getSessionMember()
  if (!member) return { error: 'Nicht eingeloggt' }

  const targetMemberId = String(formData.get('targetMemberId') ?? '')
  const freeTitle = String(formData.get('freeTitle') ?? '').trim()
  const freeConsequence = String(formData.get('freeConsequence') ?? '').trim()
  const pointsRaw = String(formData.get('points') ?? '0').trim()
  const points = pointsRaw === '' ? 0 : Number(pointsRaw)

  if (!targetMemberId || !freeTitle || !freeConsequence) {
    return { error: 'Person, Beschreibung und vorgeschlagene Strafe sind Pflicht' }
  }
  if (!Number.isInteger(points) || points < 0 || points > 50) {
    return { error: 'Minuspunkte müssen eine ganze Zahl zwischen 0 und 50 sein' }
  }

  const target = await prisma.member.findFirst({ where: { id: targetMemberId, tripId: member.tripId } })
  if (!target) return { error: 'Person nicht gefunden' }

  await prisma.penaltyEntry.create({
    data: {
      tripId: member.tripId,
      freeTitle,
      freeConsequence,
      targetMemberId,
      proposedByMemberId: member.id,
      status: 'PENDING_VOTE',
      points,
    },
  })

  revalidatePath('/strafen')
  revalidatePath('/home')
  return {}
}

export async function confirmCatalogPenalty(entryId: string) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')

  const entry = await prisma.penaltyEntry.findFirst({
    where: { id: entryId, tripId: member.tripId, targetMemberId: member.id, status: 'PENDING_TARGET' },
    include: { penaltyType: true },
  })
  if (!entry) return

  await prisma.$transaction(async (tx) => {
    await tx.penaltyEntry.update({ where: { id: entry.id }, data: { status: 'APPROVED', resolvedAt: new Date() } })
    if (entry.points > 0) {
      await applyPoints(tx, {
        tripId: member.tripId,
        memberId: member.id,
        amount: -entry.points,
        source: 'PENALTY',
        sourceId: entry.id,
        reason: `Strafe bestätigt: ${entry.penaltyType?.title ?? 'Katalog-Strafe'}`,
      })
    }
  })

  revalidatePath('/strafen')
  revalidatePath('/home')
  revalidatePath('/leaderboard')
}

export async function rejectCatalogPenalty(entryId: string) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')

  await prisma.penaltyEntry.updateMany({
    where: { id: entryId, tripId: member.tripId, targetMemberId: member.id, status: 'PENDING_TARGET' },
    data: { status: 'REJECTED', resolvedAt: new Date() },
  })

  revalidatePath('/strafen')
  revalidatePath('/home')
}

export async function voteOnPenalty(entryId: string, value: boolean) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')

  const entry = await prisma.penaltyEntry.findFirst({ where: { id: entryId, tripId: member.tripId } })
  if (!entry || entry.status !== 'PENDING_VOTE') return
  if (entry.targetMemberId === member.id) return // Betroffene stimmen nicht über sich selbst ab

  await prisma.vote.upsert({
    where: { penaltyEntryId_memberId: { penaltyEntryId: entryId, memberId: member.id } },
    update: { value },
    create: { penaltyEntryId: entryId, memberId: member.id, value },
  })

  const [eligibleCount, votes] = await Promise.all([
    prisma.member.count({ where: { tripId: member.tripId, id: { not: entry.targetMemberId } } }),
    prisma.vote.findMany({ where: { penaltyEntryId: entryId } }),
  ])

  const yesCount = votes.filter((v) => v.value).length
  const noCount = votes.filter((v) => !v.value).length

  if (yesCount >= MIN_VOTES_TO_APPROVE) {
    await prisma.$transaction(async (tx) => {
      await tx.penaltyEntry.update({ where: { id: entryId }, data: { status: 'APPROVED', resolvedAt: new Date() } })
      if (entry.points > 0) {
        await applyPoints(tx, {
          tripId: member.tripId,
          memberId: entry.targetMemberId,
          amount: -entry.points,
          source: 'PENALTY',
          sourceId: entry.id,
          reason: `Spontane Strafe bestätigt: ${entry.freeTitle ?? ''}`,
        })
      }
    })
  } else if (eligibleCount - noCount < MIN_VOTES_TO_APPROVE) {
    // Selbst wenn alle verbleibenden Mitglieder noch mit Ja stimmen würden, wird die
    // Mindestanzahl nicht mehr erreicht -- die Strafe ist damit erledigt.
    await prisma.penaltyEntry.update({ where: { id: entryId }, data: { status: 'REJECTED', resolvedAt: new Date() } })
  }

  revalidatePath('/strafen')
  revalidatePath('/home')
  revalidatePath('/leaderboard')
}

/** Der Betroffene hakt für sich selbst ab, dass er die Strafe tatsächlich erfüllt hat. */
export async function toggleFulfilled(entryId: string) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')

  const entry = await prisma.penaltyEntry.findFirst({
    where: { id: entryId, tripId: member.tripId, targetMemberId: member.id, status: 'APPROVED' },
  })
  if (!entry) return

  await prisma.penaltyEntry.update({
    where: { id: entry.id },
    data: { fulfilledAt: entry.fulfilledAt ? null : new Date() },
  })

  revalidatePath('/strafen')
  revalidatePath('/home')
}

/** Löscht einen Strafen-Eintrag. Admins dürfen jeden Eintrag entfernen (inkl. bereits
 * bestätigter, dann werden die vergebenen Minuspunkte zurückgenommen); wer selbst
 * vorgeschlagen hat, darf seinen eigenen Eintrag entfernen, solange er noch nicht bestätigt
 * ist (z.B. eine abgelehnte oder hängengebliebene Spontan-Strafe aufräumen). */
export async function deletePenaltyEntry(entryId: string) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')

  const entry = await prisma.penaltyEntry.findFirst({ where: { id: entryId, tripId: member.tripId } })
  if (!entry) return

  const isAdmin = member.role === 'ADMIN'
  const isOwnUnresolved = entry.proposedByMemberId === member.id && entry.status !== 'APPROVED'
  if (!isAdmin && !isOwnUnresolved) throw new Error('Keine Berechtigung, diese Strafe zu löschen')

  await prisma.$transaction(async (tx) => {
    if (entry.status === 'APPROVED' && entry.points > 0) {
      const awarded = await tx.pointsLedger.findMany({ where: { sourceId: entry.id, source: 'PENALTY' } })
      const amount = awarded.reduce((sum, l) => sum + l.amount, 0)
      if (amount !== 0) {
        await applyPoints(tx, {
          tripId: member.tripId,
          memberId: entry.targetMemberId,
          amount: -amount,
          source: 'PENALTY',
          sourceId: entry.id,
          reason: 'Strafe gelöscht',
        })
      }
    }
    await tx.vote.deleteMany({ where: { penaltyEntryId: entry.id } })
    await tx.penaltyEntry.delete({ where: { id: entry.id } })
  })

  revalidatePath('/strafen')
  revalidatePath('/home')
  revalidatePath('/leaderboard')
}

// ---- Admin: Strafenkatalog verwalten ----

export async function addPenaltyType(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const member = await getSessionMember()
  if (!member) return { error: 'Nicht eingeloggt' }
  if (member.role !== 'ADMIN') return { error: 'Nur der Admin kann Katalog-Strafen anlegen' }

  const title = String(formData.get('title') ?? '').trim()
  const consequence = String(formData.get('consequence') ?? '').trim()
  const pointsRaw = String(formData.get('points') ?? '0').trim()
  const points = pointsRaw === '' ? 0 : Number(pointsRaw)

  if (!title || !consequence) return { error: 'Titel und Konsequenz sind Pflichtfelder' }
  if (!Number.isInteger(points) || points < 0 || points > 50) {
    return { error: 'Minuspunkte müssen eine ganze Zahl zwischen 0 und 50 sein' }
  }

  await prisma.penaltyType.create({
    data: { tripId: member.tripId, title, consequence, points, icon: 'default' },
  })

  revalidatePath('/strafen')
  return {}
}

export async function deletePenaltyType(penaltyTypeId: string) {
  const member = await getSessionMember()
  if (!member) throw new Error('Nicht eingeloggt')
  if (member.role !== 'ADMIN') throw new Error('Nur der Admin kann Katalog-Strafen entfernen')

  await prisma.penaltyType.updateMany({
    where: { id: penaltyTypeId, tripId: member.tripId },
    data: { isActive: false },
  })

  revalidatePath('/strafen')
}
