import 'server-only'
import type { Prisma, PointsSource } from '../generated/prisma/client.ts'
import { getTripDayKey, dayKeyDiff } from '@/lib/dates'

type Tx = Prisma.TransactionClient

export const LEVEL_THRESHOLDS = [0, 50, 120, 220, 350, 500, 700, 950, 1250, 1600]

export function computeLevel(points: number): number {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return level
}

export const STREAK_BONUS_POINTS = 5

/** Einziger Ort, an dem Punkte vergeben werden. Schreibt den Ledger-Eintrag und
 * aktualisiert den denormalisierten points/level-Cache auf Member, atomar in `tx`. */
export async function applyPoints(
  tx: Tx,
  params: { tripId: string; memberId: string; amount: number; source: PointsSource; sourceId?: string; reason: string }
) {
  const member = await tx.member.findUniqueOrThrow({ where: { id: params.memberId } })
  const newPoints = member.points + params.amount
  const newLevel = computeLevel(newPoints)

  await tx.member.update({
    where: { id: params.memberId },
    data: { points: newPoints, level: newLevel },
  })

  await tx.pointsLedger.create({
    data: {
      tripId: params.tripId,
      memberId: params.memberId,
      amount: params.amount,
      source: params.source,
      sourceId: params.sourceId,
      reason: params.reason,
    },
  })
}

/** Lazy Streak-Prüfung: bei jeder Streak-relevanten Aktion aufrufen (Tagesplan-Punkt
 * abhaken, Challenge erledigen, expliziter Check-in). Idempotent pro Trip-Tag. */
export async function ensureStreakUpToDate(tx: Tx, tripId: string, memberId: string) {
  const member = await tx.member.findUniqueOrThrow({ where: { id: memberId } })
  const today = getTripDayKey()
  const lastKey = member.lastActiveDay ? getTripDayKey(member.lastActiveDay) : null

  if (lastKey === today) return // heute schon gezählt

  let newStreak = 1
  if (lastKey && dayKeyDiff(lastKey, today) === 1) {
    newStreak = member.currentStreak + 1
  }
  const newLongest = Math.max(member.longestStreak, newStreak)

  await tx.member.update({
    where: { id: memberId },
    data: { currentStreak: newStreak, longestStreak: newLongest, lastActiveDay: new Date() },
  })

  if (newStreak > 1) {
    await applyPoints(tx, {
      tripId,
      memberId,
      amount: STREAK_BONUS_POINTS,
      source: 'STREAK',
      reason: `Streak-Bonus Tag ${newStreak}`,
    })
  }
}
