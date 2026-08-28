import { getSessionMember } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTripDayKey, TRIP_TZ } from '@/lib/dates'
import { getDrinkComment } from '@/lib/drinks'
import { getDrinkWindow } from '@/lib/drink-window'
import { Card } from '@/components/ui/Card'
import { StatNumber } from '@/components/ui/StatNumber'
import { DrinkCounterGrid } from '@/components/drinks/DrinkCounterGrid'
import { DrinkHistoryChart } from '@/components/drinks/DrinkHistoryChart'
import { DrinkLogList, type DrinkLogEntry } from '@/components/drinks/DrinkLogList'
import { DrinkCategoryAdmin } from '@/components/drinks/DrinkCategoryAdmin'

const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: TRIP_TZ })

// Mittag UTC als Instant plus timeZone 'UTC': so faellt der formatierte Wochentag garantiert auf
// genau den Tag des Day-Keys, ohne Zeitzonen-Rueckrechnung.
const weekdayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'short', timeZone: 'UTC' })

function formatDayKeyShort(key: string): string {
  const [, month, day] = key.split('-')
  return `${day}.${month}.`
}

export default async function DrinksPage() {
  const member = await getSessionMember()
  if (!member) return null

  const [categories, entries] = await Promise.all([
    prisma.drinkCategory.findMany({
      where: { tripId: member.tripId, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
    }),
    prisma.drinkEntry.findMany({
      where: { tripId: member.tripId, memberId: member.id },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const today = getTripDayKey()
  const byDay = new Map<string, number>()
  const byCategoryToday = new Map<string, { label: string; count: number }>()
  const todayEntries: DrinkLogEntry[] = []

  for (const e of entries) {
    const key = getTripDayKey(e.createdAt)
    byDay.set(key, (byDay.get(key) ?? 0) + e.quantity)
    if (key === today) {
      const existing = byCategoryToday.get(e.categoryId)
      byCategoryToday.set(e.categoryId, { label: e.category.label, count: (existing?.count ?? 0) + e.quantity })
      todayEntries.push({
        id: e.id,
        categoryLabel: e.category.label,
        points: e.category.points,
        time: timeFormatter.format(e.createdAt),
      })
    }
  }
  todayEntries.reverse() // neueste zuerst

  const todayTotal = Array.from(byCategoryToday.values()).reduce((sum, c) => sum + c.count, 0)
  const todayPoints = todayEntries.reduce((sum, e) => sum + e.points, 0)

  const tripStart = new Date(member.trip.startDate)
  const dayKeys: string[] = []
  for (let i = 0; i < 8; i++) {
    const d = new Date(tripStart)
    d.setDate(d.getDate() + i)
    if (d > new Date(member.trip.endDate)) break
    dayKeys.push(getTripDayKey(d))
  }
  // Heute liegt vor Reisebeginn (oder nach Reiseende) ausserhalb der Trip-Tage. Anhaengen
  // allein reicht nicht: ohne Sortierung rendert der heutige Tag ganz rechts, obwohl er
  // chronologisch der erste ist. Day-Keys sind 'YYYY-MM-DD', sortieren also lexikografisch
  // gleich chronologisch.
  if (!dayKeys.includes(today)) dayKeys.push(today)
  dayKeys.sort()

  const chartDays = dayKeys.map((key) => ({
    key,
    weekday: weekdayFormatter.format(new Date(`${key}T12:00:00Z`)),
    dateLabel: formatDayKeyShort(key),
    count: byDay.get(key) ?? 0,
    isToday: key === today,
  }))

  const customCategories = categories.filter((c) => !c.isDefault)

  const drinkWindow = getDrinkWindow()
  const opensAtLabel = timeFormatter.format(drinkWindow.opensAt)

  return (
    <div className="flex flex-col gap-4 px-4.5 pb-6 pt-5.5">
      <h1 className="text-base font-bold text-foreground">Getränke-Tracker</h1>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Heute</h2>
          <div className="flex items-baseline gap-2">
            {/* Vor 18:00 bleibt die Zahl da, verliert aber die Signalfarbe: eine leuchtende
                Null liest sich sonst wie ein Ziel, das noch zu erreichen waere. */}
            <StatNumber size="xl" className={drinkWindow.open ? 'text-member' : 'text-muted-2'}>
              {todayTotal}
            </StatNumber>
            {drinkWindow.open && (
              <span className="text-xs text-muted-1">
                <StatNumber size="xs" className="text-muted-1">
                  +{todayPoints}
                </StatNumber>{' '}
                Pkt
              </span>
            )}
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-3">
          {Array.from(byCategoryToday.values()).map(({ label, count }) => (
            <span key={label} className="text-sm text-muted-1">
              <StatNumber size="sm" className="text-foreground">
                {count}
              </StatNumber>{' '}
              {label}
            </span>
          ))}
          {byCategoryToday.size === 0 && (
            <span className="text-sm text-muted-1">Noch nichts eingetragen.</span>
          )}
        </div>
        <p
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
            drinkWindow.open ? 'bg-member/10 text-member' : 'bg-white/[0.04] text-muted-1'
          }`}
        >
          {drinkWindow.open
            ? getDrinkComment(todayTotal)
            : `Tagsüber gibt's keine Punkte. Prost ab ${opensAtLabel}.`}
        </p>
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-bold text-foreground">Getränk eintragen</h2>
        <DrinkCounterGrid
          categories={categories}
          opensAtMs={drinkWindow.opensAt.getTime()}
          initiallyLocked={!drinkWindow.open}
          opensAtLabel={opensAtLabel}
        />
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-foreground">Heute eingetragen</h2>
        <DrinkLogList entries={todayEntries} />
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold text-foreground">Verlauf</h2>
        <DrinkHistoryChart days={chartDays} />
      </Card>

      {member.role === 'ADMIN' && <DrinkCategoryAdmin customCategories={customCategories} />}
    </div>
  )
}
