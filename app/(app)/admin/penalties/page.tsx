import { requireAdmin } from '@/lib/admin'
import { ADMIN_LIST_LIMIT } from '@/lib/admin-limits'
import { prisma } from '@/lib/db'
import { TRIP_TZ } from '@/lib/dates'
import { Card } from '@/components/ui/Card'
import { PenaltyTypeAdmin, type AdminPenaltyType } from '@/components/admin/PenaltyTypeAdmin'
import {
  PenaltyEntryAdminList,
  type AdminPenaltyEntry,
} from '@/components/admin/PenaltyEntryAdminList'

const whenFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TRIP_TZ,
})

export default async function AdminPenaltiesPage() {
  const admin = await requireAdmin()

  const [types, entries] = await Promise.all([
    prisma.penaltyType.findMany({
      where: { tripId: admin.tripId },
      orderBy: [{ isActive: 'desc' }, { title: 'asc' }],
      include: { _count: { select: { entries: true } } },
    }),
    prisma.penaltyEntry.findMany({
      where: { tripId: admin.tripId },
      orderBy: { createdAt: 'desc' },
      take: ADMIN_LIST_LIMIT,
      include: { penaltyType: true, target: true, proposedBy: true, votes: true },
    }),
  ])

  const typeRows: AdminPenaltyType[] = types.map((t) => ({
    id: t.id,
    title: t.title,
    consequence: t.consequence,
    points: t.points,
    isActive: t.isActive,
    entryCount: t._count.entries,
  }))

  const entryRows: AdminPenaltyEntry[] = entries.map((e) => ({
    id: e.id,
    title: e.penaltyType?.title ?? e.freeTitle ?? 'Strafe',
    consequence: e.penaltyType?.consequence ?? e.freeConsequence ?? '',
    status: e.status,
    points: e.points,
    targetName: e.target.name,
    targetAvatar: e.target.avatar,
    proposedByName: e.proposedBy.name,
    yesCount: e.votes.filter((v) => v.value).length,
    noCount: e.votes.filter((v) => !v.value).length,
    when: whenFormatter.format(e.createdAt),
  }))

  const openCount = entryRows.filter(
    (e) => e.status === 'PENDING_TARGET' || e.status === 'PENDING_VOTE'
  ).length

  return (
    <div className="flex flex-col gap-4">
      <Card className="animate-rise-in" style={{ animationDelay: '140ms' }}>
        <h2 className="mb-1 text-base font-bold text-foreground">Strafenkatalog</h2>
        <p className="mb-3 text-xs leading-relaxed text-muted-1">
          Ausgeblendete Katalog-Strafen lassen sich nicht mehr neu vergeben; bereits
          eingetragene bleiben bestehen.
        </p>
        <PenaltyTypeAdmin types={typeRows} />
      </Card>

      <Card className="animate-rise-in" style={{ animationDelay: '210ms' }}>
        <h2 className="mb-1 text-base font-bold text-foreground">Einträge</h2>
        <p className="mb-3 text-xs leading-relaxed text-muted-1">
          {openCount > 0
            ? `${openCount} offen. Bestätigen und Aufheben buchen die Minuspunkte automatisch mit.`
            : 'Bestätigen und Aufheben buchen die Minuspunkte automatisch mit.'}
        </p>
        <PenaltyEntryAdminList entries={entryRows} />
      </Card>
    </div>
  )
}
