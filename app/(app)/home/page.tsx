import Link from 'next/link'
import { getSessionMember } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTripDayKey } from '@/lib/dates'
import { Card } from '@/components/ui/Card'
import { PillBadge } from '@/components/ui/PillBadge'
import { StatNumber } from '@/components/ui/StatNumber'
import { WarningIcon, CupIcon } from '@/components/icons'
import { ParticipationToggle } from '@/components/plan/ParticipationToggle'
import { PenaltyFeedItem, type PenaltyFeedEntry } from '@/components/strafen/PenaltyFeedItem'
import { getAvatarHex } from '@/lib/avatar'

const HOME_PLAN_ITEM_LIMIT = 5

const dayLabelFormatter = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' })

export default async function HomePage() {
  const member = await getSessionMember()
  if (!member) return null

  const [topMembers, drinksToday, planItems, pendingPenalties] = await Promise.all([
    prisma.member.findMany({
      where: { tripId: member.tripId },
      orderBy: { points: 'desc' },
      take: 3,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-13 w-13 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-surface)', border: `2px solid ${avatarHex}`, boxShadow: `0 0 18px ${avatarHex}59` }}
          >
            <span className="font-mono text-lg font-semibold" style={{ color: avatarHex }}>
              {member.name.charAt(0).toUpperCase()}
            </span>
            <div
              className="absolute -right-2.5 -top-2 flex h-7 w-7 -rotate-[10deg] items-center justify-center rounded-[40%_60%_55%_45%/55%_45%_60%_40%] border-2 border-background"
              style={{ backgroundColor: avatarHex }}
            >
              <span className="font-mono text-[10px] font-bold text-background">
                {String(member.level).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">Hey, {member.name}!</h1>
            <p className="mt-0.5 text-xs font-medium text-muted-1">
              Level {member.level} &middot; {member.trip.name}
            </p>
          </div>
        </div>
        <PillBadge tone="violet" rotate="right">
          Punkte: {member.points}
        </PillBadge>
      </div>

      {/* Streak */}
      <Card>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-accent-lime" style={{ filter: 'drop-shadow(0 0 5px rgba(200,255,77,0.6))' }}>
            <svg viewBox="0 0 20 20" width={18} height={18} fill="currentColor" stroke="currentColor" strokeWidth={0.5}>
              <path d="M10 2.5c1.2 3-2.8 4.2-2.8 7.2a2.8 2.8 0 0 0 5.6 0c0-1-.4-1.8-.9-1.9.4 1.8-1 2.6-1.8.9-.6-1.2 0-2.7 0-2.7-1.9 1-2.9 2.9-2.9 4.6a3.9 3.9 0 0 0 7.8 0c0-3.7-2.8-4.8-5-8.1Z" />
            </svg>
          </span>
          <span className="text-sm font-bold text-foreground">{member.currentStreak}-Tage-Streak</span>
          <span className="ml-auto font-mono text-xs text-muted-2">Beste: {member.longestStreak}</span>
        </div>
        <div className="flex items-end gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => {
            const filled = i < member.currentStreak
            return (
              <div
                key={i}
                className="flex-1 rounded-full bg-accent-lime"
                style={{
                  height: filled ? 20 - i : 14,
                  opacity: filled ? Math.max(0.7, 1 - i * 0.08) : 0.09,
                  backgroundColor: filled ? undefined : 'rgba(255,255,255,0.09)',
                }}
              />
            )
          })}
        </div>
      </Card>

      {/* Leaderboard preview */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Rangliste</span>
          <Link href="/leaderboard" className="text-xs font-semibold text-muted-2">
            Alle ansehen &rarr;
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {topMembers.map((m, i) => {
            const isMe = m.id === member.id
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 rounded-2xl px-2.5 py-2 ${
                  i === 0 ? 'bg-accent-lime/7' : isMe ? 'bg-accent-violet/10' : ''
                }`}
              >
                <div
                  className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                    i === 0 ? '-rotate-6 rounded-[40%_60%_55%_45%/55%_45%_60%_40%] text-background' : 'bg-[#1c2029] text-muted-1'
                  }`}
                  style={i === 0 ? { backgroundColor: '#c8ff4d', boxShadow: '0 0 12px rgba(200,255,77,0.5)' } : isMe ? { backgroundColor: '#7a6ff0', color: '#0a0c10' } : undefined}
                >
                  {i + 1}
                </div>
                <span className={`flex-1 text-sm font-semibold ${isMe ? 'text-[#a99cff]' : 'text-foreground'}`}>
                  {isMe ? `Du (${m.name})` : m.name}
                </span>
                <StatNumber size="sm" className={i === 0 ? 'text-accent-lime' : isMe ? 'text-[#a99cff]' : 'text-muted-1'}>
                  {m.points}
                </StatNumber>
              </div>
            )
          })}
          {topMembers.length === 0 && (
            <p className="text-sm text-muted-2">Noch keine Punkte vergeben &ndash; legt los!</p>
          )}
        </div>
      </Card>

      {/* Drinks widget */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Getränke heute</span>
          <StatNumber size="xl" className="text-accent-lime" style={{ textShadow: '0 0 10px rgba(200,255,77,0.4)' }}>
            {drinksTodayCount}
          </StatNumber>
        </div>
        <Link href="/drinks" className="text-xs font-semibold text-muted-2">
          Details &amp; Getränk hinzufügen &rarr;
        </Link>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/strafen"
          className="flex flex-col items-center gap-1.5 rounded-[20px] border border-white/[0.06] bg-surface px-2 py-3.5"
        >
          <span className="flex h-8.5 w-8.5 items-center justify-center rounded-[45%_55%_60%_40%/55%_45%_55%_45%] bg-accent-lime/14 text-accent-lime">
            <WarningIcon className="h-4.5 w-4.5" />
          </span>
          <span className="text-center text-[11px] font-semibold text-foreground">Strafe eintragen</span>
        </Link>
        <Link
          href="/drinks"
          className="flex flex-col items-center gap-1.5 rounded-[20px] border border-white/[0.06] bg-surface px-2 py-3.5"
        >
          <span className="flex h-8.5 w-8.5 items-center justify-center rounded-[55%_45%_40%_60%/45%_55%_45%_55%] bg-accent-violet/16 text-[#a99cff]">
            <CupIcon className="h-4.5 w-4.5" />
          </span>
          <span className="text-center text-[11px] font-semibold text-foreground">Getränk +1</span>
        </Link>
      </div>

      {/* Tagesplan overview */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Tagesplan</span>
          <Link href="/plan" className="text-xs font-semibold text-muted-2">
            Alle ansehen &rarr;
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {visiblePlanItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-muted-2">
                    {dayLabelFormatter.format(item.day)}
                    {item.startTime ? ` · ${item.startTime}${item.endTime ? `–${item.endTime}` : ''}` : ''}
                  </span>
                  {item.points > 0 && <span className="font-mono text-[10px] text-accent-lime">+{item.points} Pkt</span>}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-foreground">{item.title}</span>
                  <span className="text-[11px] text-muted-2">{item.completions.length} dabei</span>
                </div>
              </div>
              <ParticipationToggle
                planItemId={item.id}
                joined={item.completions.some((c) => c.memberId === member.id)}
              />
            </div>
          ))}
          {visiblePlanItems.length === 0 && (
            <p className="text-sm text-muted-2">Noch keine Programmpunkte &ndash; legt den ersten im Tagesplan an.</p>
          )}
          {hasMorePlanItems && (
            <Link href="/plan" className="text-xs font-semibold text-muted-2">
              + weitere Programmpunkte &rarr;
            </Link>
          )}
        </div>
      </Card>

      {/* My pending penalties */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-sm font-bold text-foreground">Meine offenen Strafen</span>
          <Link href="/strafen" className="text-xs font-semibold text-muted-2">
            Zum Katalog &rarr;
          </Link>
        </div>
        {pendingPenaltyEntries.map((entry) => (
          <PenaltyFeedItem key={entry.id} entry={entry} />
        ))}
        {pendingPenaltyEntries.length === 0 && (
          <Card>
            <p className="text-sm text-muted-2">Aktuell nichts offen &ndash; sauber geblieben.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
