'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '../../generated/prisma/client.ts'
import { prisma } from '@/lib/db'
import { hashPin } from '@/lib/auth'
import { requireAdmin, getAdminMember, ADMIN_REVALIDATE_PATHS } from '@/lib/admin'
import { MAX_ADMIN_POINT_ADJUSTMENT, MAX_DRINK_QUANTITY } from '@/lib/admin-limits'
import { applyPoints, reversePoints, recalculatePointsFromLedger } from '@/lib/gamification'
import { MAX_PLAN_ITEM_POINTS } from '@/lib/plan'
import { AVATAR_COLORS } from '@/lib/validations'

export interface ActionState {
  error?: string
  success?: string
}

/** Der Admin-Bereich fasst Daten aus allen Screens an, deshalb wird pauschal alles
 * invalidiert statt an jeder Action einzeln zu ueberlegen, was betroffen ist. */
function revalidateAll(): void {
  for (const path of ADMIN_REVALIDATE_PATHS) revalidatePath(path)
}

function parseIntField(raw: FormDataEntryValue | null, fallback: number): number {
  const value = String(raw ?? '').trim()
  if (value === '') return fallback
  return Number(value)
}

// ---- Mitglieder verwalten ----

/**
 * Entfernt ein Mitglied endgueltig. Prisma kennt fuer Member keine Cascades, deshalb wird
 * der Rattenschwanz hier von Hand und in einer Transaktion abgeraeumt.
 *
 * Wichtig ist die Trennung zweier Datenarten: rein persoenliche Daten (Getraenke, eigene
 * Teilnahmen, Stimmen, Ledger) verschwinden mit der Person, waehrend Dinge, die die Person
 * nur *fuer die Gruppe angelegt* hat (Programmpunkte, von ihr vorgeschlagene Strafen), auf
 * den Admin uebergehen -- sonst reisst das Loeschen einer Person Loecher in den Tagesplan
 * aller anderen.
 */
export async function deleteMember(memberId: string): Promise<void> {
  const admin = await requireAdmin()

  if (memberId === admin.id) {
    throw new Error('Du kannst dich nicht selbst löschen')
  }

  const target = await prisma.member.findFirst({
    where: { id: memberId, tripId: admin.tripId },
  })
  if (!target) return

  await prisma.$transaction(async (tx) => {
    // Strafen gegen die Person verlieren ohne sie ihren Sinn -- samt der Stimmen darauf.
    const targeted = await tx.penaltyEntry.findMany({
      where: { targetMemberId: target.id },
      select: { id: true },
    })
    const targetedIds = targeted.map((e) => e.id)
    if (targetedIds.length > 0) {
      await tx.vote.deleteMany({ where: { penaltyEntryId: { in: targetedIds } } })
      await tx.penaltyEntry.deleteMany({ where: { id: { in: targetedIds } } })
    }

    // Eigene Stimmen auf den verbleibenden Strafen.
    await tx.vote.deleteMany({ where: { memberId: target.id } })

    // Gruppen-Inhalte gehen an den Admin ueber statt geloescht zu werden.
    await tx.planItem.updateMany({
      where: { createdByMemberId: target.id },
      data: { createdByMemberId: admin.id },
    })
    await tx.penaltyEntry.updateMany({
      where: { proposedByMemberId: target.id },
      data: { proposedByMemberId: admin.id },
    })

    // Rein persoenliche Daten.
    await tx.planItemCompletion.deleteMany({ where: { memberId: target.id } })
    await tx.drinkEntry.deleteMany({ where: { memberId: target.id } })
    await tx.challengeCompletion.deleteMany({ where: { memberId: target.id } })
    await tx.awardVote.deleteMany({
      where: { OR: [{ voterMemberId: target.id }, { nomineeMemberId: target.id }] },
    })
    await tx.pointsLedger.deleteMany({ where: { memberId: target.id } })

    await tx.member.delete({ where: { id: target.id } })
  })

  revalidateAll()
}

export async function renameMember(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const memberId = String(formData.get('memberId') ?? '')
  const name = String(formData.get('name') ?? '').trim()

  if (name.length < 2 || name.length > 20) {
    return { error: 'Name muss zwischen 2 und 20 Zeichen haben' }
  }

  const target = await prisma.member.findFirst({ where: { id: memberId, tripId: admin.tripId } })
  if (!target) return { error: 'Mitglied nicht gefunden' }
  if (target.name === name) return { success: 'Unverändert' }

  try {
    await prisma.member.update({ where: { id: target.id }, data: { name } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: 'Diesen Namen gibt es im Trip schon' }
    }
    throw err
  }

  revalidateAll()
  return { success: `Umbenannt in ${name}` }
}

export async function setMemberAvatar(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const memberId = String(formData.get('memberId') ?? '')
  const avatar = String(formData.get('avatar') ?? '')

  if (!(AVATAR_COLORS as readonly string[]).includes(avatar)) {
    return { error: 'Unbekannte Farbe' }
  }

  const target = await prisma.member.findFirst({ where: { id: memberId, tripId: admin.tripId } })
  if (!target) return { error: 'Mitglied nicht gefunden' }
  if (target.avatar === avatar) return { success: 'Unverändert' }

  try {
    await prisma.member.update({ where: { id: target.id }, data: { avatar } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: 'Diese Farbe ist im Trip schon vergeben' }
    }
    throw err
  }

  revalidateAll()
  return { success: 'Farbe geändert' }
}

/**
 * Überträgt bzw. entzieht die Admin-Rolle. Der letzte Admin kann nicht degradiert werden --
 * sonst hätte der Trip niemanden mehr, der ihn verwaltet, und die Rolle liesse sich ohne
 * direkten DB-Zugriff nicht zurückholen.
 */
export async function setMemberRole(memberId: string, makeAdmin: boolean): Promise<void> {
  const admin = await requireAdmin()

  const target = await prisma.member.findFirst({ where: { id: memberId, tripId: admin.tripId } })
  if (!target) return
  if (target.role === (makeAdmin ? 'ADMIN' : 'MEMBER')) return

  if (!makeAdmin) {
    const adminCount = await prisma.member.count({ where: { tripId: admin.tripId, role: 'ADMIN' } })
    if (adminCount <= 1) throw new Error('Der Trip braucht mindestens einen Admin')
  }

  await prisma.member.update({
    where: { id: target.id },
    data: { role: makeAdmin ? 'ADMIN' : 'MEMBER' },
  })

  revalidateAll()
}

/** Setzt die PIN eines Mitglieds neu -- der einzige Weg zurück in den Trip, wenn jemand
 * seine PIN vergisst (die App selbst bietet bewusst kein Self-Service-Reset). */
export async function resetMemberPin(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const memberId = String(formData.get('memberId') ?? '')
  const pin = String(formData.get('pin') ?? '').trim()

  if (!/^\d{4}$/.test(pin)) return { error: 'PIN muss genau 4 Ziffern haben' }

  const target = await prisma.member.findFirst({ where: { id: memberId, tripId: admin.tripId } })
  if (!target) return { error: 'Mitglied nicht gefunden' }

  await prisma.member.update({ where: { id: target.id }, data: { pinHash: await hashPin(pin) } })

  return { success: `Neue PIN für ${target.name}: ${pin}` }
}

/** Manuelle Punktekorrektur. Läuft über denselben Ledger wie jede andere Punktvergabe,
 * damit die Rangliste nachvollziehbar bleibt. */
export async function adjustMemberPoints(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const memberId = String(formData.get('memberId') ?? '')
  const amount = parseIntField(formData.get('amount'), 0)
  const reason = String(formData.get('reason') ?? '').trim()

  if (!Number.isInteger(amount) || amount === 0) {
    return { error: 'Bitte eine Punktzahl ungleich 0 angeben' }
  }
  if (Math.abs(amount) > MAX_ADMIN_POINT_ADJUSTMENT) {
    return { error: `Maximal ${MAX_ADMIN_POINT_ADJUSTMENT} Punkte auf einmal` }
  }
  if (!reason) return { error: 'Bitte einen Grund angeben' }

  const target = await prisma.member.findFirst({ where: { id: memberId, tripId: admin.tripId } })
  if (!target) return { error: 'Mitglied nicht gefunden' }

  await prisma.$transaction(async (tx) => {
    await applyPoints(tx, {
      tripId: admin.tripId,
      memberId: target.id,
      amount,
      source: 'ADMIN_ADJUST',
      reason,
    })
  })

  revalidateAll()
  return { success: `${amount > 0 ? '+' : ''}${amount} Punkte für ${target.name}` }
}

// ---- Getränke: Kategorien und Einträge ----

export async function addDrinkCategory(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const label = String(formData.get('label') ?? '').trim()
  const points = parseIntField(formData.get('points'), 0)

  if (!label) return { error: 'Bitte einen Namen angeben' }
  if (!Number.isInteger(points) || points < 0 || points > 20) {
    return { error: 'Punkte müssen eine ganze Zahl zwischen 0 und 20 sein' }
  }

  const existing = await prisma.drinkCategory.findUnique({
    where: { tripId_label: { tripId: admin.tripId, label } },
  })

  if (existing) {
    if (existing.isActive) return { error: 'Diese Kategorie gibt es schon' }
    await prisma.drinkCategory.update({ where: { id: existing.id }, data: { isActive: true, points } })
  } else {
    const maxSort = await prisma.drinkCategory.aggregate({
      where: { tripId: admin.tripId },
      _max: { sortOrder: true },
    })
    await prisma.drinkCategory.create({
      data: {
        tripId: admin.tripId,
        label,
        points,
        isDefault: false,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    })
  }

  revalidateAll()
  return { success: `Kategorie "${label}" angelegt` }
}

export async function updateDrinkCategory(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const categoryId = String(formData.get('categoryId') ?? '')
  const label = String(formData.get('label') ?? '').trim()
  const points = parseIntField(formData.get('points'), 0)

  if (!label) return { error: 'Bitte einen Namen angeben' }
  if (!Number.isInteger(points) || points < 0 || points > 20) {
    return { error: 'Punkte müssen eine ganze Zahl zwischen 0 und 20 sein' }
  }

  const category = await prisma.drinkCategory.findFirst({
    where: { id: categoryId, tripId: admin.tripId },
  })
  if (!category) return { error: 'Kategorie nicht gefunden' }

  try {
    await prisma.drinkCategory.update({ where: { id: category.id }, data: { label, points } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: 'Eine Kategorie mit diesem Namen gibt es schon' }
    }
    throw err
  }

  revalidateAll()
  return { success: 'Kategorie aktualisiert' }
}

/** Standard-Kategorien bleiben bestehen; eigene werden nur deaktiviert, damit bereits
 * geloggte Getränke und die dafür vergebenen Punkte unangetastet bleiben. */
export async function setDrinkCategoryActive(categoryId: string, isActive: boolean): Promise<void> {
  const admin = await requireAdmin()

  const category = await prisma.drinkCategory.findFirst({
    where: { id: categoryId, tripId: admin.tripId },
  })
  if (!category) return
  if (category.isDefault && !isActive) throw new Error('Standard-Kategorien lassen sich nicht deaktivieren')

  await prisma.drinkCategory.update({ where: { id: category.id }, data: { isActive } })

  revalidateAll()
}

/** Löscht den Getränke-Eintrag eines beliebigen Mitglieds und nimmt die dafür vergebenen
 * Punkte zurück (Mitglieder selbst können nur ihre eigenen Einträge löschen). */
export async function deleteDrinkEntryAsAdmin(entryId: string): Promise<void> {
  const admin = await requireAdmin()

  const entry = await prisma.drinkEntry.findFirst({
    where: { id: entryId, tripId: admin.tripId },
    include: { category: true },
  })
  if (!entry) return

  await prisma.$transaction(async (tx) => {
    await reversePoints(tx, {
      tripId: admin.tripId,
      memberId: entry.memberId,
      source: 'DRINK_RANKING',
      sourceId: entry.id,
      reason: `Getränk vom Admin entfernt (${entry.category.label})`,
    })
    await tx.drinkEntry.delete({ where: { id: entry.id } })
  })

  revalidateAll()
}

/** Korrigiert die Menge eines Getränke-Eintrags und bucht die Punktdifferenz nach. */
export async function updateDrinkEntryQuantity(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const entryId = String(formData.get('entryId') ?? '')
  const quantity = parseIntField(formData.get('quantity'), 0)

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_DRINK_QUANTITY) {
    return { error: `Menge muss zwischen 1 und ${MAX_DRINK_QUANTITY} liegen` }
  }

  const entry = await prisma.drinkEntry.findFirst({
    where: { id: entryId, tripId: admin.tripId },
    include: { category: true },
  })
  if (!entry) return { error: 'Eintrag nicht gefunden' }
  if (entry.quantity === quantity) return { success: 'Unverändert' }

  // Die Differenz wird als eigene Ledger-Zeile nachgebucht, statt die alte Buchung zu
  // überschreiben -- so bleibt im Verlauf sichtbar, dass korrigiert wurde.
  const delta = (quantity - entry.quantity) * entry.category.points

  await prisma.$transaction(async (tx) => {
    await tx.drinkEntry.update({ where: { id: entry.id }, data: { quantity } })
    if (delta !== 0) {
      await applyPoints(tx, {
        tripId: admin.tripId,
        memberId: entry.memberId,
        amount: delta,
        source: 'DRINK_RANKING',
        sourceId: entry.id,
        reason: `Menge korrigiert (${entry.category.label}: ${entry.quantity} → ${quantity})`,
      })
    }
  })

  revalidateAll()
  return { success: 'Menge aktualisiert' }
}

// ---- Strafen: Katalog und Einträge ----

export async function addPenaltyType(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const title = String(formData.get('title') ?? '').trim()
  const consequence = String(formData.get('consequence') ?? '').trim()
  const points = parseIntField(formData.get('points'), 0)

  if (!title || !consequence) return { error: 'Titel und Konsequenz sind Pflichtfelder' }
  if (!Number.isInteger(points) || points < 0 || points > 50) {
    return { error: 'Minuspunkte müssen eine ganze Zahl zwischen 0 und 50 sein' }
  }

  await prisma.penaltyType.create({
    data: { tripId: admin.tripId, title, consequence, points, icon: 'default' },
  })

  revalidateAll()
  return { success: `"${title}" angelegt` }
}

export async function updatePenaltyType(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const penaltyTypeId = String(formData.get('penaltyTypeId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const consequence = String(formData.get('consequence') ?? '').trim()
  const points = parseIntField(formData.get('points'), 0)

  if (!title || !consequence) return { error: 'Titel und Konsequenz sind Pflichtfelder' }
  if (!Number.isInteger(points) || points < 0 || points > 50) {
    return { error: 'Minuspunkte müssen eine ganze Zahl zwischen 0 und 50 sein' }
  }

  const updated = await prisma.penaltyType.updateMany({
    where: { id: penaltyTypeId, tripId: admin.tripId },
    data: { title, consequence, points },
  })
  if (updated.count === 0) return { error: 'Katalog-Strafe nicht gefunden' }

  revalidateAll()
  return { success: 'Katalog-Strafe aktualisiert' }
}

/** Soft-Delete: bereits eingetragene Strafen dieses Typs bleiben erhalten. */
export async function setPenaltyTypeActive(penaltyTypeId: string, isActive: boolean): Promise<void> {
  const admin = await requireAdmin()

  await prisma.penaltyType.updateMany({
    where: { id: penaltyTypeId, tripId: admin.tripId },
    data: { isActive },
  })

  revalidateAll()
}

/**
 * Setzt den Status eines Strafen-Eintrags von Hand -- der Ausweg, wenn eine Abstimmung
 * hängenbleibt (etwa weil nach dem Löschen eines Mitglieds nie genug Stimmen zusammenkommen).
 * Die Minuspunkte folgen dem Status: sie werden beim Wechsel nach APPROVED gebucht und beim
 * Verlassen wieder zurückgenommen.
 */
export async function setPenaltyEntryStatus(entryId: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
  const admin = await requireAdmin()

  const entry = await prisma.penaltyEntry.findFirst({
    where: { id: entryId, tripId: admin.tripId },
    include: { penaltyType: true },
  })
  if (!entry || entry.status === status) return

  const label = entry.penaltyType?.title ?? entry.freeTitle ?? 'Strafe'

  await prisma.$transaction(async (tx) => {
    if (status === 'APPROVED') {
      // Erst alte Buchungen neutralisieren, dann frisch buchen -- so kann eine erneute
      // Bestätigung die Punkte nicht zweimal abziehen.
      await reversePoints(tx, {
        tripId: admin.tripId,
        memberId: entry.targetMemberId,
        source: 'PENALTY',
        sourceId: entry.id,
        reason: `Strafe neu bewertet (${label})`,
      })
      if (entry.points > 0) {
        await applyPoints(tx, {
          tripId: admin.tripId,
          memberId: entry.targetMemberId,
          amount: -entry.points,
          source: 'PENALTY',
          sourceId: entry.id,
          reason: `Strafe vom Admin bestätigt: ${label}`,
        })
      }
    } else {
      await reversePoints(tx, {
        tripId: admin.tripId,
        memberId: entry.targetMemberId,
        source: 'PENALTY',
        sourceId: entry.id,
        reason: `Strafe vom Admin aufgehoben: ${label}`,
      })
    }

    await tx.penaltyEntry.update({
      where: { id: entry.id },
      data: { status, resolvedAt: new Date() },
    })
  })

  revalidateAll()
}

export async function deletePenaltyEntryAsAdmin(entryId: string): Promise<void> {
  const admin = await requireAdmin()

  const entry = await prisma.penaltyEntry.findFirst({
    where: { id: entryId, tripId: admin.tripId },
  })
  if (!entry) return

  await prisma.$transaction(async (tx) => {
    await reversePoints(tx, {
      tripId: admin.tripId,
      memberId: entry.targetMemberId,
      source: 'PENALTY',
      sourceId: entry.id,
      reason: 'Strafe vom Admin gelöscht',
    })
    await tx.vote.deleteMany({ where: { penaltyEntryId: entry.id } })
    await tx.penaltyEntry.delete({ where: { id: entry.id } })
  })

  revalidateAll()
}

// ---- Tagesplan ----

export async function updatePlanItem(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const planItemId = String(formData.get('planItemId') ?? '')
  const day = String(formData.get('day') ?? '').trim()
  const startTime = String(formData.get('startTime') ?? '').trim()
  const endTime = String(formData.get('endTime') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const points = parseIntField(formData.get('points'), 0)

  if (!day || !title) return { error: 'Tag und Titel sind Pflichtfelder' }

  const dayDate = new Date(day)
  if (Number.isNaN(dayDate.getTime())) return { error: 'Ungültiges Datum' }

  if (!Number.isInteger(points) || points < 0 || points > MAX_PLAN_ITEM_POINTS) {
    return { error: `Punkte müssen eine ganze Zahl zwischen 0 und ${MAX_PLAN_ITEM_POINTS} sein` }
  }

  const planItem = await prisma.planItem.findFirst({
    where: { id: planItemId, tripId: admin.tripId },
    include: { completions: true },
  })
  if (!planItem) return { error: 'Programmpunkt nicht gefunden' }

  await prisma.$transaction(async (tx) => {
    await tx.planItem.update({
      where: { id: planItem.id },
      data: {
        day: dayDate,
        startTime: startTime || null,
        endTime: endTime || null,
        title,
        description: description || null,
        points,
      },
    })

    // Ändert sich die Punktzahl, muss sie bei allen, die bereits zugesagt haben, nachgezogen
    // werden -- sonst stimmt die Rangliste nicht mehr mit dem Plan überein.
    if (points !== planItem.points) {
      for (const completion of planItem.completions) {
        await reversePoints(tx, {
          tripId: admin.tripId,
          memberId: completion.memberId,
          source: 'PLAN_ITEM',
          sourceId: completion.id,
          reason: `Punkte des Programmpunkts geändert (${title})`,
        })
        if (points > 0) {
          await applyPoints(tx, {
            tripId: admin.tripId,
            memberId: completion.memberId,
            amount: points,
            source: 'PLAN_ITEM',
            sourceId: completion.id,
            reason: `Teilnahme neu bewertet (${title})`,
          })
        }
      }
    }
  })

  revalidateAll()
  return { success: 'Programmpunkt aktualisiert' }
}

export async function deletePlanItemAsAdmin(planItemId: string): Promise<void> {
  const admin = await requireAdmin()

  const planItem = await prisma.planItem.findFirst({
    where: { id: planItemId, tripId: admin.tripId },
    include: { completions: true },
  })
  if (!planItem) return

  await prisma.$transaction(async (tx) => {
    for (const completion of planItem.completions) {
      await reversePoints(tx, {
        tripId: admin.tripId,
        memberId: completion.memberId,
        source: 'PLAN_ITEM',
        sourceId: completion.id,
        reason: `Programmpunkt vom Admin gelöscht (${planItem.title})`,
      })
    }
    await tx.planItemCompletion.deleteMany({ where: { planItemId: planItem.id } })
    await tx.planItem.delete({ where: { id: planItem.id } })
  })

  revalidateAll()
}

/** Nimmt die Teilnahme eines Mitglieds an einem Programmpunkt zurück (inkl. Punkte). */
export async function removeParticipationAsAdmin(completionId: string): Promise<void> {
  const admin = await requireAdmin()

  const completion = await prisma.planItemCompletion.findFirst({
    where: { id: completionId, planItem: { tripId: admin.tripId } },
    include: { planItem: true },
  })
  if (!completion) return

  await prisma.$transaction(async (tx) => {
    await reversePoints(tx, {
      tripId: admin.tripId,
      memberId: completion.memberId,
      source: 'PLAN_ITEM',
      sourceId: completion.id,
      reason: `Teilnahme vom Admin entfernt (${completion.planItem.title})`,
    })
    await tx.planItemCompletion.delete({ where: { id: completion.id } })
  })

  revalidateAll()
}

// ---- Trip-Einstellungen ----

export async function updateTrip(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await getAdminMember()
  if (!admin) return { error: 'Keine Berechtigung' }

  const name = String(formData.get('name') ?? '').trim()
  const startDate = String(formData.get('startDate') ?? '').trim()
  const endDate = String(formData.get('endDate') ?? '').trim()

  if (!name) return { error: 'Bitte einen Trip-Namen angeben' }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: 'Ungültiges Datum' }
  }
  if (end < start) return { error: 'Das Ende darf nicht vor dem Start liegen' }

  await prisma.trip.update({
    where: { id: admin.tripId },
    data: { name, startDate: start, endDate: end },
  })

  revalidateAll()
  return { success: 'Trip aktualisiert' }
}

// ---- Wartung ----

/** Gleicht den points/level-Cache aller Mitglieder wieder mit dem Ledger ab. */
export async function recalculatePoints(): Promise<ActionState> {
  const admin = await requireAdmin()

  const corrected = await prisma.$transaction(async (tx) =>
    recalculatePointsFromLedger(tx, admin.tripId)
  )

  revalidateAll()
  return {
    success:
      corrected === 0
        ? 'Alle Punktestände waren bereits korrekt'
        : `${corrected} Punktestand${corrected === 1 ? '' : 'e'} korrigiert`,
  }
}
