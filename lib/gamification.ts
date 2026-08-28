import 'server-only'
import type { Prisma, PointsSource } from '../generated/prisma/client.ts'

type Tx = Prisma.TransactionClient

/** Punkte pro Level. Feste Schrittweite statt einer Schwellwert-Tabelle: das Level steigt
 * dadurch gleichmaessig weiter und laeuft nicht wie vorher nach dem letzten Tabellenwert aus. */
export const POINTS_PER_LEVEL = 20

export function computeLevel(points: number): number {
  // Minuspunkte (Strafen) koennen den Stand unter null druecken -- Level 1 ist der Boden,
  // ein Level 0 oder negatives Level waere in der Anzeige sinnlos.
  return Math.max(1, Math.floor(points / POINTS_PER_LEVEL) + 1)
}

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

/** Nimmt alle fuer `sourceId` vergebenen Punkte wieder zurueck und gibt den gebuchten
 * Betrag zurueck (0, wenn es nichts zurueckzunehmen gab). Die Gegenbuchung laeuft bewusst
 * ueber `applyPoints`, damit der Ledger die Korrektur als eigene Zeile ausweist statt
 * Historie zu loeschen. */
export async function reversePoints(
  tx: Tx,
  params: { tripId: string; memberId: string; source: PointsSource; sourceId: string; reason: string }
): Promise<number> {
  const awarded = await tx.pointsLedger.findMany({
    where: { source: params.source, sourceId: params.sourceId },
  })
  const amount = awarded.reduce((sum, l) => sum + l.amount, 0)
  if (amount === 0) return 0

  await applyPoints(tx, {
    tripId: params.tripId,
    memberId: params.memberId,
    amount: -amount,
    source: params.source,
    sourceId: params.sourceId,
    reason: params.reason,
  })
  return -amount
}

/** Setzt den denormalisierten points/level-Cache aller Mitglieder auf die Summe ihrer
 * Ledger-Eintraege zurueck. Der Ledger ist die Quelle der Wahrheit -- das hier ist das
 * Reparaturwerkzeug, falls der Cache je auseinanderlaeuft. Gibt zurueck, wie viele
 * Mitglieder korrigiert wurden. */
export async function recalculatePointsFromLedger(tx: Tx, tripId: string): Promise<number> {
  const [members, sums] = await Promise.all([
    tx.member.findMany({ where: { tripId }, select: { id: true, points: true, level: true } }),
    tx.pointsLedger.groupBy({ by: ['memberId'], where: { tripId }, _sum: { amount: true } }),
  ])

  const totals = new Map(sums.map((s) => [s.memberId, s._sum.amount ?? 0]))

  let corrected = 0
  for (const m of members) {
    const total = totals.get(m.id) ?? 0
    const level = computeLevel(total)
    // Auch das Level pruefen, nicht nur die Punkte: aendert sich die Level-Formel, stimmen
    // die Punkte weiterhin, waehrend jedes gespeicherte Level veraltet ist. Ohne diese
    // Bedingung liesse sich genau das hier nie reparieren.
    if (total === m.points && level === m.level) continue
    await tx.member.update({
      where: { id: m.id },
      data: { points: total, level },
    })
    corrected += 1
  }
  return corrected
}
