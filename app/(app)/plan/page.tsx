import { getSessionMember } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTripDayKey } from '@/lib/dates'
import { Card } from '@/components/ui/Card'
import { ParticipantAvatars } from '@/components/plan/ParticipantAvatars'
import { PlanItemParticipation } from '@/components/plan/PlanItemParticipation'
import { PastDaysDisclosure } from '@/components/plan/PastDaysDisclosure'
import { AddPlanItemForm } from '@/components/plan/AddPlanItemForm'
import { DeletePlanItemButton } from '@/components/plan/DeletePlanItemButton'

// Mittag UTC als Instant plus timeZone 'UTC': der formatierte Tag entspricht damit garantiert
// dem Day-Key, ohne Zeitzonen-Rueckrechnung.
const dayFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
})

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

  const today = getTripDayKey()
  const groups = Array.from(grouped.entries()).map(([dayKey, dayItems]) => ({
    dayKey,
    dayItems,
    isPast: dayKey < today,
    isToday: dayKey === today,
  }))
  const pastGroups = groups.filter((g) => g.isPast)
  const upcomingGroups = groups.filter((g) => !g.isPast)
  // Vergangene Tage nur wegklappen, wenn danach ueberhaupt noch etwas kommt: nach dem letzten
  // Reisetag waere sonst der komplette Plan verborgen.
  const collapsePast = pastGroups.length > 0 && upcomingGroups.length > 0

  function renderGroup({ dayKey, dayItems, isToday }: (typeof groups)[number]) {
    return (
      <section key={dayKey} className="flex flex-col gap-2">
        <h2
          className={`px-0.5 text-sm font-bold uppercase tracking-wide ${
            isToday ? 'text-member' : 'text-muted-1'
          }`}
        >
          {isToday && 'Heute · '}
          {dayFormatter.format(new Date(`${dayKey}T12:00:00Z`))}
        </h2>

        <ul className="flex flex-col gap-2">
          {dayItems.map((item) => {
            const joined = item.completions.some((c) => c.memberId === member!.id)
            const participants = item.completions.map((c) => ({
              id: c.member.id,
              name: c.member.name,
              avatar: c.member.avatar,
            }))
            // Ende vor Start heisst hier nicht "kaputt", sondern "geht ueber Mitternacht" —
            // eine Clubnacht von 22:30 bis 04:00 ist gewollt und wird markiert, nicht verboten.
            const overnight = Boolean(
              item.startTime && item.endTime && item.endTime < item.startTime,
            )
            const timeLabel = item.startTime
              ? item.endTime
                ? `${item.startTime}–${item.endTime}`
                : item.startTime
              : null

            return (
              <li key={item.id} id={`plan-item-${item.id}`}>
                <Card>
                  {/* Grid statt Flex, damit der Loeschen-Button optisch oben rechts sitzt, im
                      DOM aber NACH der Hauptaktion kommt: vorher war der zweite Tab-Stopp der
                      Seite ein unwiderruflicher Loeschbutton. Platzierung bewusst inline: die
                      Tailwind-Utilities fuer Spalten- und Zeilenplatzierung werden in diesem
                      Setup nicht generiert. */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', columnGap: 12 }}>
                    <div style={{ gridColumn: '1', gridRow: '1' }}>
                      {timeLabel && (
                        <p className="mb-0.5 text-[11px] text-muted-2">
                          {timeLabel}
                          {overnight && <span>{' · Folgetag'}</span>}
                        </p>
                      )}
                      <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                      {item.description && (
                        <p className="mt-0.5 text-sm text-muted-1">{item.description}</p>
                      )}
                    </div>

                    <div
                      className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-3"
                      style={{ gridColumn: '1 / 3', gridRow: '2' }}
                    >
                      <ParticipantAvatars participants={participants} />
                      <PlanItemParticipation
                        planItemId={item.id}
                        joined={joined}
                        points={item.points}
                        itemTitle={item.title}
                      />
                    </div>

                    {item.createdByMemberId === member!.id && (
                      <div style={{ gridColumn: '2', gridRow: '1', justifySelf: 'end' }}>
                        <DeletePlanItemButton planItemId={item.id} title={item.title} />
                      </div>
                    )}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4.5 pb-6 pt-5.5">
      <h1 className="text-base font-bold text-foreground">Tagesplan</h1>

      {collapsePast ? (
        <>
          <PastDaysDisclosure count={pastGroups.length}>
            {pastGroups.map(renderGroup)}
          </PastDaysDisclosure>
          {upcomingGroups.map(renderGroup)}
        </>
      ) : (
        groups.map(renderGroup)
      )}

      {items.length === 0 && (
        <p className="text-sm text-muted-1">
          Noch nichts geplant. Irgendwer muss den Anfang machen.
        </p>
      )}

      <AddPlanItemForm defaultDay={today} />
    </div>
  )
}
