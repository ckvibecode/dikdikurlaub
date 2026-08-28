import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { getTripDayKey } from '@/lib/dates'
import { Card } from '@/components/ui/Card'
import { PlanItemAdminCard, type AdminPlanItem } from '@/components/admin/PlanItemAdminCard'

// Mittag UTC als Instant plus timeZone 'UTC': der formatierte Tag entspricht damit garantiert
// dem Day-Key, ohne Zeitzonen-Rückrechnung (gleiches Vorgehen wie auf dem Plan-Screen).
const dayFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
})

export default async function AdminPlanPage() {
  const admin = await requireAdmin()

  const items = await prisma.planItem.findMany({
    where: { tripId: admin.tripId },
    orderBy: [{ day: 'asc' }, { sortOrder: 'asc' }],
    include: { createdBy: true, completions: { include: { member: true } } },
  })

  const grouped = new Map<string, AdminPlanItem[]>()
  for (const item of items) {
    const dayKey = getTripDayKey(item.day)
    const row: AdminPlanItem = {
      id: item.id,
      day: dayKey,
      startTime: item.startTime,
      endTime: item.endTime,
      title: item.title,
      description: item.description,
      points: item.points,
      createdByName: item.createdBy.name,
      participants: item.completions.map((c) => ({
        completionId: c.id,
        name: c.member.name,
        avatar: c.member.avatar,
      })),
    }
    if (!grouped.has(dayKey)) grouped.set(dayKey, [])
    grouped.get(dayKey)!.push(row)
  }

  const today = getTripDayKey()
  const groups = Array.from(grouped.entries())

  return (
    <div className="flex flex-col gap-4">
      <p className="animate-rise-in px-0.5 text-xs leading-relaxed text-muted-1" style={{ animationDelay: '140ms' }}>
        Hier lässt sich jeder Programmpunkt bearbeiten — unabhängig davon, wer ihn angelegt hat.
        Ein Tippen auf einen Namen trägt die Person wieder aus.
      </p>

      {groups.length === 0 && (
        <Card className="animate-rise-in" style={{ animationDelay: '210ms' }}>
          <p className="text-sm text-muted-1">Noch keine Programmpunkte angelegt.</p>
        </Card>
      )}

      {groups.map(([dayKey, dayItems], i) => (
        <Card key={dayKey} className="animate-rise-in" style={{ animationDelay: `${210 + i * 70}ms` }}>
          <h2
            className={`mb-3 text-sm font-bold uppercase tracking-wide ${
              dayKey === today ? 'text-member' : 'text-muted-1'
            }`}
          >
            {dayKey === today && 'Heute · '}
            {dayFormatter.format(new Date(`${dayKey}T12:00:00Z`))}
          </h2>
          <div className="flex flex-col gap-2">
            {dayItems.map((item) => (
              <PlanItemAdminCard key={item.id} item={item} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
