import { getSessionMember } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { StatNumber } from '@/components/ui/StatNumber'

export default async function LeaderboardPage() {
  const member = await getSessionMember()
  if (!member) return null

  const members = await prisma.member.findMany({
    where: { tripId: member.tripId },
    orderBy: { points: 'desc' },
  })

  return (
    <div className="flex flex-col gap-4 px-4.5 pb-6 pt-5.5">
      <h1 className="text-lg font-bold text-foreground">Rangliste</h1>
      <Card>
        <div className="flex flex-col gap-2">
          {members.map((m, i) => {
            const isMe = m.id === member.id
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 rounded-2xl px-2.5 py-2.5 ${
                  i === 0 ? 'bg-accent-lime/7' : isMe ? 'bg-accent-violet/10' : ''
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                    i === 0 ? '-rotate-6 rounded-[40%_60%_55%_45%/55%_45%_60%_40%] text-background' : 'bg-[#1c2029] text-muted-1'
                  }`}
                  style={
                    i === 0
                      ? { backgroundColor: '#c8ff4d', boxShadow: '0 0 12px rgba(200,255,77,0.5)' }
                      : isMe
                        ? { backgroundColor: '#7a6ff0', color: '#0a0c10' }
                        : undefined
                  }
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isMe ? 'text-[#a99cff]' : 'text-foreground'}`}>
                    {isMe ? `Du (${m.name})` : m.name}
                  </p>
                  <p className="text-[11px] text-muted-2">Level {m.level} &middot; {m.currentStreak}-Tage-Streak</p>
                </div>
                <StatNumber size="md" className={i === 0 ? 'text-accent-lime' : isMe ? 'text-[#a99cff]' : 'text-muted-1'}>
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
