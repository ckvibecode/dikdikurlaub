import { requireAdmin } from '@/lib/admin'
import { ADMIN_LIST_LIMIT } from '@/lib/admin-limits'
import { prisma } from '@/lib/db'
import { TRIP_TZ } from '@/lib/dates'
import { getAvatarHex } from '@/lib/avatar'
import { Card } from '@/components/ui/Card'
import { StatNumber } from '@/components/ui/StatNumber'

const whenFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TRIP_TZ,
})

const SOURCE_LABEL: Record<string, string> = {
  CHALLENGE: 'Challenge',
  DRINK_RANKING: 'Getränk',
  PLAN_ITEM: 'Programmpunkt',
  PENALTY: 'Strafe',
  AWARD: 'Award',
  ADMIN_ADJUST: 'Korrektur',
}

export default async function AdminLedgerPage() {
  const admin = await requireAdmin()

  const [entries, members] = await Promise.all([
    prisma.pointsLedger.findMany({
      where: { tripId: admin.tripId },
      orderBy: { createdAt: 'desc' },
      take: ADMIN_LIST_LIMIT,
      include: { member: true },
    }),
    prisma.member.findMany({
      where: { tripId: admin.tripId },
      orderBy: [{ points: 'desc' }, { createdAt: 'asc' }],
      select: { id: true, name: true, avatar: true, points: true },
    }),
  ])

  return (
    <div className="flex flex-col gap-4">
      <Card className="animate-rise-in" style={{ animationDelay: '140ms' }}>
        <h2 className="mb-3 text-base font-bold text-foreground">Aktuelle Stände</h2>
        <div className="flex flex-col gap-1.5">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: getAvatarHex(m.avatar) }}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{m.name}</span>
              <StatNumber size="sm" className="shrink-0 text-foreground">
                {m.points}
              </StatNumber>
            </div>
          ))}
        </div>
      </Card>

      <Card className="animate-rise-in" style={{ animationDelay: '210ms' }}>
        <h2 className="mb-1 text-base font-bold text-foreground">Buchungen</h2>
        <p className="mb-3 text-xs leading-relaxed text-muted-1">
          Jede Punktveränderung im Trip, neueste zuerst — die letzten {ADMIN_LIST_LIMIT}. Nur zum
          Nachlesen: korrigiert wird über die jeweilige Stelle, nicht hier.
        </p>

        {entries.length === 0 ? (
          <p className="text-sm text-muted-1">Noch keine Punkte vergeben.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {entries.map((e) => (
              <div key={e.id} className="flex items-baseline gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 translate-y-0.5 rounded-full"
                  style={{ backgroundColor: getAvatarHex(e.member.avatar) }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{e.reason}</p>
                  <p className="text-[11px] text-muted-2">
                    {e.member.name} · {SOURCE_LABEL[e.source] ?? e.source} · {whenFormatter.format(e.createdAt)}
                  </p>
                </div>
                <StatNumber
                  size="sm"
                  className={`shrink-0 ${e.amount < 0 ? 'text-danger' : 'text-member'}`}
                >
                  {e.amount > 0 ? `+${e.amount}` : e.amount}
                </StatNumber>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
