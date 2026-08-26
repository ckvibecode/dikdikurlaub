'use client'

import { useTransition } from 'react'
import {
  confirmCatalogPenalty,
  rejectCatalogPenalty,
  voteOnPenalty,
  toggleFulfilled,
  deletePenaltyEntry,
} from '@/lib/actions/penalty-actions'
import { MIN_VOTES_TO_APPROVE } from '@/lib/penalties'
import { Button } from '@/components/ui/Button'
import { PillBadge } from '@/components/ui/PillBadge'
import { CheckIcon, TrashIcon } from '@/components/icons'

export interface PenaltyFeedEntry {
  id: string
  status: 'PENDING_TARGET' | 'PENDING_VOTE' | 'APPROVED' | 'REJECTED'
  title: string
  consequence: string
  targetName: string
  proposedByName: string
  isTargetMe: boolean
  points: number
  fulfilled: boolean
  yesCount: number
  noCount: number
  eligibleCount: number
  myVote: boolean | null
  canDelete: boolean
}

export function PenaltyFeedItem({ entry }: { entry: PenaltyFeedEntry }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-surface p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {entry.targetName} &middot; {entry.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-1">Strafe: {entry.consequence}</p>
          <p className="mt-0.5 text-[11px] text-muted-2">vorgeschlagen von {entry.proposedByName}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {entry.points > 0 && (
            <span className="font-mono text-[11px] font-semibold text-[#ff6f6f]">-{entry.points} Pkt</span>
          )}
          <StatusBadge status={entry.status} fulfilled={entry.fulfilled} />
          {entry.canDelete && (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => deletePenaltyEntry(entry.id))}
              aria-label="Strafe löschen"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-2 transition-colors hover:bg-white/[0.06] hover:text-[#ff6f6f] disabled:opacity-50"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {entry.status === 'PENDING_TARGET' && entry.isTargetMe && (
        <div className="mt-1 flex gap-2">
          <Button
            variant="primary"
            disabled={pending}
            onClick={() => startTransition(() => confirmCatalogPenalty(entry.id))}
          >
            Stimmt, akzeptiere
          </Button>
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => startTransition(() => rejectCatalogPenalty(entry.id))}
          >
            War nicht ich
          </Button>
        </div>
      )}

      {entry.status === 'PENDING_VOTE' && !entry.isTargetMe && (
        <div className="mt-1 flex items-center gap-2">
          <Button
            variant="primary"
            disabled={pending}
            onClick={() => startTransition(() => voteOnPenalty(entry.id, true))}
            className={entry.myVote === true ? 'ring-2 ring-accent-lime' : ''}
          >
            Ja, zählt
          </Button>
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => startTransition(() => voteOnPenalty(entry.id, false))}
            className={entry.myVote === false ? 'ring-2 ring-white/40' : ''}
          >
            Nein
          </Button>
          <span className="ml-auto font-mono text-[11px] text-muted-2">
            {entry.yesCount}/{MIN_VOTES_TO_APPROVE} Bestätigungen
          </span>
        </div>
      )}

      {entry.status === 'PENDING_VOTE' && entry.isTargetMe && (
        <p className="text-xs text-muted-2">
          Die Gruppe stimmt ab ({entry.yesCount}/{MIN_VOTES_TO_APPROVE} Bestätigungen, {entry.noCount} Ablehnungen).
        </p>
      )}

      {entry.status === 'APPROVED' && entry.isTargetMe && (
        <div className="mt-1">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => toggleFulfilled(entry.id))}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
              entry.fulfilled
                ? 'bg-accent-lime text-background'
                : 'border border-white/15 bg-transparent text-muted-1 hover:border-accent-lime/50 hover:text-accent-lime'
            }`}
          >
            {entry.fulfilled && <CheckIcon className="h-3.5 w-3.5" />}
            {entry.fulfilled ? 'Erfüllt' : 'Als erfüllt abhaken'}
          </button>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, fulfilled }: { status: PenaltyFeedEntry['status']; fulfilled: boolean }) {
  if (status === 'APPROVED') return <PillBadge tone="lime">{fulfilled ? 'Erfüllt' : 'Bestätigt'}</PillBadge>
  if (status === 'REJECTED') return <PillBadge tone="neutral">Abgelehnt</PillBadge>
  if (status === 'PENDING_TARGET') return <PillBadge tone="violet">Wartet auf Bestätigung</PillBadge>
  return <PillBadge tone="violet">Abstimmung läuft</PillBadge>
}
