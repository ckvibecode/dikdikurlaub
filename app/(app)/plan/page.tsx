import { getSessionMember } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTripDayKey } from '@/lib/dates'
import { Card } from '@/components/ui/Card'
import { PillBadge } from '@/components/ui/PillBadge'
import { ParticipationToggle } from '@/components/plan/ParticipationToggle'
import { ParticipantAvatars } from '@/components/plan/ParticipantAvatars'
import { AddPlanItemForm } from '@/components/plan/AddPlanItemForm'
import { DeletePlanItemButton } from '@/components/plan/DeletePlanItemButton'

export default async function PlanPage() {
  const member = await getSessionMember()
  if (!member) return null

  const items = await prisma.planItem.findMany({
    where: { tripId: member.tripId },
    orderBy: [{ day: 'asc' }, { sortOrder: 'asc' }],
    include: { completions: { include: { member: true } } },
  })

  const grouped = new Map<string, typeof items>()
  for (const item of items) {
    const key = getTripDayKey(item.day)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(item)
  }

  const dayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' })

  return (
    <div className="flex flex-col gap-5 px-4.5 pb-6 pt-5.5">
      <h1 className="text-lg font-bold text-foreground">Tagesplan</h1>

      {Array.from(grouped.entries()).map(([dayKey, dayItems]) => (
        <div key={dayKey} className="flex flex-col gap-2.5">
          <p className="px-0.5 text-xs font-bold uppercase tracking-wide text-muted-2">
            {dayFormatter.format(new Date(`${dayKey}T12:00:00`))}
          </p>
          {dayItems.map((item) => {
            const joined = item.completions.some((c) => c.memberId === member.id)
            const participants = item.completions.map((c) => ({
              id: c.member.id,
              name: c.member.name,
              avatar: c.member.avatar,
            }))
            const timeLabel = item.startTime
              ? item.endTime
                ? `${item.startTime}–${item.endTime}`
                : item.startTime
              : null

            return (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {timeLabel && <p className="mb-0.5 font-mono text-[11px] text-muted-2">{timeLabel}</p>}
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    {item.description && <p className="mt-0.5 text-xs text-muted-1">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {item.points > 0 && (
                      <PillBadge tone="lime" rotate="right">
                        +{item.points} Pkt
                      </PillBadge>
                    )}
                    {item.createdByMemberId === member.id && (
                      <DeletePlanItemButton planItemId={item.id} title={item.title} />
                    )}
                  </div>
                </div>
                <div className="mt-3.5 flex items-center justify-between gap-3">
                  <ParticipantAvatars participants={participants} />
                  <ParticipationToggle planItemId={item.id} joined={joined} />
                </div>
              </Card>
            )
          })}
        </div>
      ))}

      {items.length === 0 && (
        <Card>
          <p className="text-sm text-muted-1">Noch keine Programmpunkte &ndash; legt den ersten an.</p>
        </Card>
      )}

      <AddPlanItemForm defaultDay={getTripDayKey()} />
    </div>
  )
}
