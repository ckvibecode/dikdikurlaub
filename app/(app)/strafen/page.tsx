import { getSessionMember } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { LogCatalogPenaltyForm } from '@/components/strafen/LogCatalogPenaltyForm'
import { ProposeSpontaneousForm } from '@/components/strafen/ProposeSpontaneousForm'
import { PenaltyFeedItem, type PenaltyFeedEntry } from '@/components/strafen/PenaltyFeedItem'
import { PenaltyTypeAdmin } from '@/components/strafen/PenaltyTypeAdmin'

export default async function StrafenPage() {
  const member = await getSessionMember()
  if (!member) return null

  const [members, penaltyTypes, entries, totalMemberCount] = await Promise.all([
    prisma.member.findMany({ where: { tripId: member.tripId }, orderBy: { name: 'asc' } }),
    prisma.penaltyType.findMany({ where: { tripId: member.tripId, isActive: true }, orderBy: { title: 'asc' } }),
    prisma.penaltyEntry.findMany({
      where: { tripId: member.tripId },
      orderBy: { createdAt: 'desc' },
      include: { penaltyType: true, target: true, proposedBy: true, votes: true },
      take: 30,
    }),
    prisma.member.count({ where: { tripId: member.tripId } }),
  ])

  const isAdmin = member.role === 'ADMIN'

  const feedEntries: PenaltyFeedEntry[] = entries.map((e) => {
    const myVote = e.votes.find((v) => v.memberId === member.id)
    const canDelete = isAdmin || (e.proposedByMemberId === member.id && e.status !== 'APPROVED')
    return {
      id: e.id,
      status: e.status,
      title: e.penaltyType?.title ?? e.freeTitle ?? '',
      consequence: e.penaltyType?.consequence ?? e.freeConsequence ?? '',
      targetName: e.target.name,
      proposedByName: e.proposedBy.name,
      isTargetMe: e.targetMemberId === member.id,
      points: e.points,
      fulfilled: e.fulfilledAt !== null,
      yesCount: e.votes.filter((v) => v.value).length,
      noCount: e.votes.filter((v) => !v.value).length,
      eligibleCount: totalMemberCount - 1,
      myVote: myVote ? myVote.value : null,
      canDelete,
    }
  })

  return (
    <div className="flex flex-col gap-4 px-4.5 pb-6 pt-5.5">
      <h1 className="text-lg font-bold text-foreground">Strafenkatalog</h1>

      <LogCatalogPenaltyForm members={members} penaltyTypes={penaltyTypes} />
      <ProposeSpontaneousForm members={members} />

      <div className="flex flex-col gap-2.5">
        {feedEntries.map((entry) => (
          <PenaltyFeedItem key={entry.id} entry={entry} />
        ))}
        {feedEntries.length === 0 && (
          <Card>
            <p className="text-sm text-muted-1">Noch keine Strafen &ndash; bisher ein braves Trip. Mal sehen, wie lange noch.</p>
          </Card>
        )}
      </div>

      {isAdmin && <PenaltyTypeAdmin penaltyTypes={penaltyTypes} />}
    </div>
  )
}
