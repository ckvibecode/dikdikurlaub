import { requireAdmin } from '@/lib/admin'
import { ADMIN_LIST_LIMIT } from '@/lib/admin-limits'
import { prisma } from '@/lib/db'
import { TRIP_TZ } from '@/lib/dates'
import { Card } from '@/components/ui/Card'
import { DrinkCategoryAdmin, type AdminDrinkCategory } from '@/components/admin/DrinkCategoryAdmin'
import { DrinkEntryAdminList, type AdminDrinkEntry } from '@/components/admin/DrinkEntryAdminList'

const whenFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TRIP_TZ,
})

export default async function AdminDrinksPage() {
  const admin = await requireAdmin()

  const [categories, entries] = await Promise.all([
    prisma.drinkCategory.findMany({
      where: { tripId: admin.tripId },
      orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
      include: { _count: { select: { entries: true } } },
    }),
    // Bewusst über alle Mitglieder und begrenzt: der Admin räumt hier Fehleinträge weg,
    // dafür reicht das jüngste Fenster.
    prisma.drinkEntry.findMany({
      where: { tripId: admin.tripId },
      orderBy: { createdAt: 'desc' },
      take: ADMIN_LIST_LIMIT,
      include: { member: true, category: true },
    }),
  ])

  const categoryRows: AdminDrinkCategory[] = categories.map((c) => ({
    id: c.id,
    label: c.label,
    points: c.points,
    isDefault: c.isDefault,
    isActive: c.isActive,
    entryCount: c._count.entries,
  }))

  const entryRows: AdminDrinkEntry[] = entries.map((e) => ({
    id: e.id,
    memberName: e.member.name,
    memberAvatar: e.member.avatar,
    categoryLabel: e.category.label,
    quantity: e.quantity,
    when: whenFormatter.format(e.createdAt),
  }))

  return (
    <div className="flex flex-col gap-4">
      <Card className="animate-rise-in" style={{ animationDelay: '140ms' }}>
        <h2 className="mb-1 text-base font-bold text-foreground">Kategorien</h2>
        <p className="mb-3 text-xs leading-relaxed text-muted-1">
          Ausgeblendete Kategorien verschwinden nur aus der Auswahl — bereits geloggte Getränke
          und die Punkte dafür bleiben erhalten.
        </p>
        <DrinkCategoryAdmin categories={categoryRows} />
      </Card>

      <Card className="animate-rise-in" style={{ animationDelay: '210ms' }}>
        <h2 className="mb-1 text-base font-bold text-foreground">Einträge</h2>
        <p className="mb-3 text-xs leading-relaxed text-muted-1">
          Die letzten {ADMIN_LIST_LIMIT} Einträge aller Mitglieder. Löschen und Mengenänderungen
          buchen die Punkte automatisch mit.
        </p>
        <DrinkEntryAdminList entries={entryRows} />
      </Card>
    </div>
  )
}
