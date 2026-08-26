import { getSessionMember } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTripDayKey, TRIP_TZ } from '@/lib/dates'
import { getDrinkComment } from '@/lib/drinks'
import { Card } from '@/components/ui/Card'
import { StatNumber } from '@/components/ui/StatNumber'
import { DrinkCounterGrid } from '@/components/drinks/DrinkCounterGrid'
import { DrinkHistoryChart } from '@/components/drinks/DrinkHistoryChart'
import { DrinkLogList, type DrinkLogEntry } from '@/components/drinks/DrinkLogList'
import { DrinkCategoryAdmin } from '@/components/drinks/DrinkCategoryAdmin'

const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: TRIP_TZ })

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
  if (!dayKeys.includes(today)) dayKeys.push(today)

  const chartDays = dayKeys.map((key, i) => ({ label: `T${i + 1}`, count: byDay.get(key) ?? 0 }))

  const customCategories = categories.filter((c) => !c.isDefault)

  return (
    <div className="flex flex-col gap-4 px-4.5 pb-6 pt-5.5">
      <h1 className="text-lg font-bold text-foreground">Getränke-Tracker</h1>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Heute</span>
          <div className="flex items-baseline gap-2">
            <StatNumber size="xl" className="text-accent-lime">
              {todayTotal}
            </StatNumber>
            <span className="font-mono text-xs text-muted-2">+{todayPoints} Pkt</span>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-3">
          {Array.from(byCategoryToday.values()).map(({ label, count }) => (
            <span key={label} className="text-xs text-muted-1">
              <span className="font-mono font-semibold text-foreground">{count}</span> {label}
            </span>
          ))}
          {byCategoryToday.size === 0 && <span className="text-xs text-muted-2">Noch nichts geloggt.</span>}
        </div>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-lime/10 px-3 py-1 text-xs font-semibold text-accent-lime">
          {getDrinkComment(todayTotal)}
        </p>
      </Card>

      <div>
        <p className="mb-2 text-sm font-bold text-foreground">Getränk hinzufügen</p>
        <DrinkCounterGrid categories={categories} />
      </div>

      <Card>
        <p className="mb-3 text-sm font-bold text-foreground">Heute geloggt</p>
        <DrinkLogList entries={todayEntries} />
      </Card>

      <Card>
        <p className="mb-3 text-sm font-bold text-foreground">Verlauf</p>
        <DrinkHistoryChart days={chartDays} />
      </Card>

      {member.role === 'ADMIN' && <DrinkCategoryAdmin customCategories={customCategories} />}
    </div>
  )
}
