import Link from 'next/link'
import { getSessionMember } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTripDayKey } from '@/lib/dates'
import { Card } from '@/components/ui/Card'
import { PillBadge } from '@/components/ui/PillBadge'
import { StatNumber } from '@/components/ui/StatNumber'
import { PlanItemParticipation } from '@/components/plan/PlanItemParticipation'
import { PenaltyFeedItem, type PenaltyFeedEntry } from '@/components/strafen/PenaltyFeedItem'
import { getAvatarHex } from '@/lib/avatar'

const HOME_PLAN_ITEM_LIMIT = 2
const LEADERBOARD_PREVIEW_LIMIT = 4

const dayLabelFormatter = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' })

export default async function HomePage() {
  const member = await getSessionMember()
  if (!member) return null

  const [allMembers, drinksToday, planItems, pendingPenalties] = await Promise.all([
    prisma.member.findMany({
      where: { tripId: member.tripId },
      orderBy: [{ points: 'desc' }, { createdAt: 'asc' }],
    }),
    prisma.drinkEntry.findMany({
      where: { tripId: member.tripId, memberId: member.id },
    }),
    prisma.planItem.findMany({
      where: { tripId: member.tripId },
      orderBy: [{ day: 'asc' }, { sortOrder: 'asc' }],
      include: { completions: true },
      take: HOME_PLAN_ITEM_LIMIT + 1,
    }),
    prisma.penaltyEntry.findMany({
      where: {
        tripId: member.tripId,
        targetMemberId: member.id,
        OR: [{ status: 'PENDING_TARGET' }, { status: 'APPROVED', fulfilledAt: null }],
      },
      orderBy: { createdAt: 'desc' },
      include: { penaltyType: true, target: true, proposedBy: true },
    }),
  ])

  // Bei Punktgleichstand gibt es keinen Ersten: sonst kroent die Sortierung willkuerlich.
  const topPoints = allMembers[0]?.points ?? 0
  const leaderIsUnique = topPoints > 0 && allMembers.filter((m) => m.points === topPoints).length === 1

  const myRank = allMembers.findIndex((m) => m.id === member.id) + 1
  const preview = allMembers.slice(0, LEADERBOARD_PREVIEW_LIMIT)
  const meInPreview = preview.some((m) => m.id === member.id)
  const rows = meInPreview ? preview : [...preview.slice(0, LEADERBOARD_PREVIEW_LIMIT - 1), member]

  const visiblePlanItems = planItems.slice(0, HOME_PLAN_ITEM_LIMIT)
  const hasMorePlanItems = planItems.length > HOME_PLAN_ITEM_LIMIT

  const pendingPenaltyEntries: PenaltyFeedEntry[] = pendingPenalties.map((e) => ({
    id: e.id,
    status: e.status,
    title: e.penaltyType?.title ?? e.freeTitle ?? '',
    consequence: e.penaltyType?.consequence ?? e.freeConsequence ?? '',
    targetName: e.target.name,
    proposedByName: e.proposedBy.name,
    isTargetMe: true,
    points: e.points,
    fulfilled: e.fulfilledAt !== null,
    yesCount: 0,
    noCount: 0,
    eligibleCount: 0,
    myVote: null,
    canDelete: false,
  }))

  const today = getTripDayKey()
  const drinksTodayCount = drinksToday
    .filter((d) => getTripDayKey(d.createdAt) === today)
    .reduce((sum, d) => sum + d.quantity, 0)

  const avatarHex = getAvatarHex(member.avatar)

  return (
    <div className="relative flex flex-col gap-4 px-4.5 pb-6 pt-5.5">
      {/* Kopfzeile */}
      <div className="animate-rise-in flex items-center gap-3">
        <div
          className="bloom relative flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-2 bg-surface"
          style={{ borderColor: avatarHex }}
        >
          <span className="text-lg font-bold" style={{ color: avatarHex }}>
            {member.name.charAt(0).toUpperCase()}
          </span>
          <span
            className="absolute -right-2.5 -top-2 flex h-7 w-7 -rotate-[10deg] items-center justify-center rounded-blob border-2 border-background"
            style={{ backgroundColor: avatarHex }}
          >
            <StatNumber size="xs" className="font-bold text-background">
              {member.level}
            </StatNumber>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-foreground">Hey, {member.name}!</h1>
          <p className="mt-0.5 truncate text-sm text-muted-1">{member.trip.name}</p>
        </div>
        <PillBadge tone="member" rotate="right">
          <StatNumber size="sm">{member.points}</StatNumber> Pkt
        </PillBadge>
      </div>

      {/* Rangliste — der Held des Screens */}
      <Card className="animate-rise-in p-4" style={{ animationDelay: '70ms' }}>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-bold text-foreground">Rangliste</h2>
          <span className="text-sm text-muted-1">
            Du auf Platz <StatNumber size="sm" className="text-foreground">{myRank}</StatNumber> von{' '}
            <StatNumber size="sm" className="text-foreground">{allMembers.length}</StatNumber>
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {rows.map((m) => {
            const rank = allMembers.findIndex((x) => x.id === m.id) + 1
            const isMe = m.id === member.id
            const isLeader = rank === 1 && leaderIsUnique
            const hex = getAvatarHex(m.avatar)
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-2xl px-2.5 py-2"
                style={isMe ? { backgroundColor: `${hex}1f` } : undefined}
              >
                {/* Rang 1 wird durch Groesse, Blob-Form und Bloom markiert, nicht durch eine
                    zweite Farbe: der Farbton gehoert der Person. */}
                <span
                  className={`flex shrink-0 items-center justify-center ${
                    isLeader ? 'bloom h-11 w-11 rounded-blob -rotate-6' : 'h-9 w-9 rounded-full'
                  }`}
                  style={{ backgroundColor: hex, '--bloom-color': hex } as React.CSSProperties}
                >
                  <StatNumber size={isLeader ? 'md' : 'sm'} className="font-bold text-background">
                    {rank}
                  </StatNumber>
                </span>
                <span className="flex-1 truncate text-sm font-semibold text-foreground">
                  {isMe ? `Du (${m.name})` : m.name}
                </span>
                <StatNumber size="md" className="shrink-0 text-foreground">
                  {m.points}
                </StatNumber>
              </div>
            )
          })}
        </div>
        <Link
          href="/leaderboard"
          className="mt-2 flex min-h-11 items-center text-sm font-semibold text-muted-1"
        >
          Ganze Rangliste &rarr;
        </Link>
      </Card>

      {/* Statuszeile: drei persoenliche Zahlen, eine Zeile, kein Glow */}
      <Card className="animate-rise-in p-4" style={{ animationDelay: '140ms' }}>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/drinks" className="flex min-h-11 flex-col justify-center">
            <StatNumber size="lg" className="text-member">
              {drinksTodayCount}
            </StatNumber>
            <span className="mt-0.5 text-sm text-muted-1">Drinks heute</span>
          </Link>
          <div className="flex min-h-11 flex-col justify-center">
            <StatNumber size="lg" className="text-member">
              {member.level}
            </StatNumber>
            <span className="mt-0.5 text-sm text-muted-1">Level</span>
          </div>
        </div>
      </Card>

      {/* Offene Strafen — nur wenn es welche gibt */}
      {pendingPenaltyEntries.length > 0 && (
        <div className="animate-rise-in flex flex-col gap-2.5" style={{ animationDelay: '210ms' }}>
          <h2 className="px-0.5 text-base font-bold text-foreground">Deine offenen Strafen</h2>
          {pendingPenaltyEntries.map((entry) => (
            <PenaltyFeedItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Tagesplan — auf die naechsten zwei gekuerzt */}
      <Card className="animate-rise-in p-4" style={{ animationDelay: '280ms' }}>
        <h2 className="mb-3 text-base font-bold text-foreground">Als Nächstes</h2>
        <div className="flex flex-col gap-3.5">
          {visiblePlanItems.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
              {/* flexBasis statt fester Spalte: solange der Titel mindestens 180px haette,
                  bleibt die Aktion in derselben Zeile — sonst rutscht sie darunter, statt die
                  Metazeile mitten im Wort umzubrechen. */}
              <div className="min-w-0 flex-1" style={{ flexBasis: 180 }}>
                <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 text-sm text-muted-1">
                  {dayLabelFormatter.format(item.day)}
                  {item.startTime ? ` · ${item.startTime}${item.endTime ? `–${item.endTime}` : ''}` : ''}
                  {item.completions.length > 0 ? ` · ${item.completions.length} dabei` : ''}
                </p>
              </div>
              <PlanItemParticipation
                planItemId={item.id}
                joined={item.completions.some((c) => c.memberId === member.id)}
                points={item.points}
                itemTitle={item.title}
              />
            </div>
          ))}
          {visiblePlanItems.length === 0 && (
            <p className="text-sm text-muted-1">Noch nichts geplant &ndash; legt den ersten Punkt im Plan an.</p>
          )}
        </div>
        <Link href="/plan" className="mt-2 flex min-h-11 items-center text-sm font-semibold text-muted-1">
          {hasMorePlanItems ? 'Ganzer Tagesplan' : 'Zum Tagesplan'} &rarr;
        </Link>
      </Card>
    </div>
  )
}
