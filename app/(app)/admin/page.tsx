import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { StatNumber } from '@/components/ui/StatNumber'
import { TripSettingsForm } from '@/components/admin/TripSettingsForm'
import { RecalculatePointsButton } from '@/components/admin/RecalculatePointsButton'

/** Die Trip-Daten liegen als Mitternacht-UTC in der DB -- `toISOString` trifft damit genau
 * den gemeinten Kalendertag für das date-Input. */
function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export default async function AdminOverviewPage() {
  const admin = await requireAdmin()

  const [memberCount, drinkCount, planItemCount, penaltyCount, openPenaltyCount, ledgerCount, admins] =
    await Promise.all([
      prisma.member.count({ where: { tripId: admin.tripId } }),
      prisma.drinkEntry.count({ where: { tripId: admin.tripId } }),
      prisma.planItem.count({ where: { tripId: admin.tripId } }),
      prisma.penaltyEntry.count({ where: { tripId: admin.tripId } }),
      prisma.penaltyEntry.count({
        where: { tripId: admin.tripId, status: { in: ['PENDING_TARGET', 'PENDING_VOTE'] } },
      }),
      prisma.pointsLedger.count({ where: { tripId: admin.tripId } }),
      prisma.member.findMany({
        where: { tripId: admin.tripId, role: 'ADMIN' },
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true },
      }),
    ])

  const stats = [
    { label: 'Personen', value: memberCount },
    { label: 'Getränke', value: drinkCount },
    { label: 'Programmpunkte', value: planItemCount },
    { label: 'Strafen', value: penaltyCount },
    { label: 'davon offen', value: openPenaltyCount },
    { label: 'Punkt-Buchungen', value: ledgerCount },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card className="animate-rise-in" style={{ animationDelay: '140ms' }}>
        <h2 className="mb-3 text-base font-bold text-foreground">Im Trip</h2>
        <div className="grid grid-cols-3 gap-y-3">
          {stats.map((s) => (
            <div key={s.label}>
              <StatNumber size="lg" className="text-member">
                {s.value}
              </StatNumber>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-1">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="animate-rise-in" style={{ animationDelay: '210ms' }}>
        <h2 className="mb-3 text-base font-bold text-foreground">Trip-Einstellungen</h2>
        <TripSettingsForm
          name={admin.trip.name}
          startDate={toDateInputValue(admin.trip.startDate)}
          endDate={toDateInputValue(admin.trip.endDate)}
        />
        <p className="mt-3 text-[11px] leading-relaxed text-muted-2">
          Der Trip-Code <span className="font-mono text-muted-1">{admin.trip.code}</span> lässt sich
          hier nicht ändern: Er steckt in der Server-Konfiguration, und ein Wechsel würde alle
          aussperren, die schon beigetreten sind.
        </p>
      </Card>

      <Card className="animate-rise-in" style={{ animationDelay: '280ms' }}>
        <h2 className="mb-1 text-base font-bold text-foreground">Wartung</h2>
        <p className="mb-3 text-xs leading-relaxed text-muted-1">
          Jede Punktvergabe steht im Ledger; die Rangliste liest eine mitgeführte Summe. Sollten
          die beiden je auseinanderlaufen, setzt das hier die Summe wieder auf den Ledger.
        </p>
        <RecalculatePointsButton />
      </Card>

      <Card className="animate-rise-in" style={{ animationDelay: '350ms' }}>
        <h2 className="mb-1 text-base font-bold text-foreground">Wer verwaltet</h2>
        <p className="mb-2 text-xs leading-relaxed text-muted-1">
          Für alle anderen ist diese Rolle unsichtbar — es gibt kein Abzeichen in der Rangliste
          und keinen Weg hierher.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {admins.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center rounded-full border border-member/45 bg-member/14 px-3 py-1 text-xs font-semibold text-member"
            >
              {a.name}
              {a.id === admin.id && ' (du)'}
            </span>
          ))}
        </div>
      </Card>
    </div>
  )
}
