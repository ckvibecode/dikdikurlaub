import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { MemberAdminCard, type AdminMemberRow } from '@/components/admin/MemberAdminCard'

export default async function AdminMembersPage() {
  const admin = await requireAdmin()

  const members = await prisma.member.findMany({
    where: { tripId: admin.tripId },
    orderBy: [{ points: 'desc' }, { createdAt: 'asc' }],
    include: {
      // Zählungen statt der Datensätze: die Karte zeigt nur, wie viel an einer Person hängt,
      // damit vor dem Löschen klar ist, was mit verschwindet.
      _count: {
        select: {
          drinkEntries: true,
          penaltiesReceived: true,
          planItemsCreated: true,
          planCompletions: true,
        },
      },
    },
  })

  const adminCount = members.filter((m) => m.role === 'ADMIN').length
  const takenAvatars = members.map((m) => m.avatar)

  const rows: AdminMemberRow[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar,
    role: m.role,
    points: m.points,
    level: m.level,
    drinkCount: m._count.drinkEntries,
    penaltyCount: m._count.penaltiesReceived,
    planItemCount: m._count.planItemsCreated,
    participationCount: m._count.planCompletions,
  }))

  return (
    <div className="flex flex-col gap-2.5">
      <p className="animate-rise-in px-0.5 text-xs leading-relaxed text-muted-1" style={{ animationDelay: '140ms' }}>
        Antippen öffnet die Verwaltung einer Person: Name, Farbe, Punkte, PIN und Rolle.
      </p>

      <div className="animate-rise-in flex flex-col gap-2.5" style={{ animationDelay: '210ms' }}>
        {rows.map((m) => (
          <MemberAdminCard
            key={m.id}
            member={m}
            isSelf={m.id === admin.id}
            takenAvatars={takenAvatars}
            isOnlyAdmin={m.role === 'ADMIN' && adminCount <= 1}
          />
        ))}
      </div>
    </div>
  )
}
