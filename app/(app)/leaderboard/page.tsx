import { getSessionMember } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { StatNumber } from '@/components/ui/StatNumber'
import { RankTitleBadge } from '@/components/ui/RankTitleBadge'
import { getRankTitles } from '@/lib/titles'
import { getAvatarHex } from '@/lib/avatar'

export default async function LeaderboardPage() {
  const member = await getSessionMember()
  if (!member) return null

  const members = await prisma.member.findMany({
    where: { tripId: member.tripId },
    orderBy: [{ points: 'desc' }, { createdAt: 'asc' }],
  })

  // Bei Punktgleichstand gibt es keine Fuehrung: sonst kroent die Sortierreihenfolge
  // willkuerlich jemanden.
  const topPoints = members[0]?.points ?? 0
  const leaderIsUnique = topPoints > 0 && members.filter((m) => m.points === topPoints).length === 1

  const titles = getRankTitles(members)

  return (
    <div className="flex flex-col gap-4 px-4.5 pb-6 pt-5.5">
      <h1 className="animate-rise-in text-lg font-bold text-foreground">Rangliste</h1>
      <Card className="animate-rise-in p-4" style={{ animationDelay: '70ms' }}>
        <div className="flex flex-col gap-1.5">
          {members.map((m, i) => {
            const isMe = m.id === member.id
            const isLeader = i === 0 && leaderIsUnique
            const hex = getAvatarHex(m.avatar)
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5"
                style={isMe ? { backgroundColor: `${hex}1f` } : undefined}
              >
                {/* Rang 1: Groesse, Blob-Form und Bloom statt einer zweiten Farbe. */}
                <span
                  className={`flex shrink-0 items-center justify-center ${
                    isLeader ? 'bloom h-11 w-11 rounded-blob -rotate-6' : 'h-9 w-9 rounded-full'
                  }`}
                  style={{ backgroundColor: hex, '--bloom-color': hex } as React.CSSProperties}
                >
                  <StatNumber size={isLeader ? 'md' : 'sm'} className="font-bold text-background">
                    {i + 1}
                  </StatNumber>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {isMe ? `Du (${m.name})` : m.name}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm text-muted-1">Level {m.level}</span>
                    {m.id === titles.firstId && <RankTitleBadge variant="first" />}
                    {m.id === titles.lastId && <RankTitleBadge variant="last" />}
                  </div>
                </div>
                <StatNumber size="md" className="shrink-0 text-foreground">
                  {m.points}
                </StatNumber>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
