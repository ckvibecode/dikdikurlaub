'use client'

import { setPenaltyEntryStatus, deletePenaltyEntryAsAdmin } from '@/lib/actions/admin-actions'
import { getAvatarHex } from '@/lib/avatar'
import { ConfirmActionButton } from '@/components/admin/ConfirmActionButton'
import { TrashIcon } from '@/components/icons'

export type AdminPenaltyStatus = 'PENDING_TARGET' | 'PENDING_VOTE' | 'APPROVED' | 'REJECTED'

const STATUS_LABEL: Record<AdminPenaltyStatus, string> = {
  PENDING_TARGET: 'wartet auf Bestätigung',
  PENDING_VOTE: 'in Abstimmung',
  APPROVED: 'bestätigt',
  REJECTED: 'abgelehnt',
}

const STATUS_TONE: Record<AdminPenaltyStatus, string> = {
  PENDING_TARGET: 'border-white/10 bg-white/[0.06] text-muted-1',
  PENDING_VOTE: 'border-white/10 bg-white/[0.06] text-muted-1',
  APPROVED: 'border-danger/40 bg-danger/12 text-danger',
  REJECTED: 'border-white/10 bg-white/[0.04] text-muted-2',
}

export interface AdminPenaltyEntry {
  id: string
  title: string
  consequence: string
  status: AdminPenaltyStatus
  points: number
  targetName: string
  targetAvatar: string
  proposedByName: string
  yesCount: number
  noCount: number
  when: string
}

function EntryRow({ entry }: { entry: AdminPenaltyEntry }) {
  const hex = getAvatarHex(entry.targetAvatar)
  const isOpen = entry.status === 'PENDING_TARGET' || entry.status === 'PENDING_VOTE'

  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-white/[0.03] p-3">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-background"
          style={{ backgroundColor: hex }}
        >
          {entry.targetName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{entry.title}</p>
          <p className="text-[11px] text-muted-2">{entry.consequence}</p>
          <p className="mt-1 text-[11px] text-muted-2">
            {entry.targetName} · von {entry.proposedByName} · {entry.when}
            {entry.status === 'PENDING_VOTE' && ` · ${entry.yesCount} dafür / ${entry.noCount} dagegen`}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_TONE[entry.status]}`}
        >
          {entry.points > 0 ? `−${entry.points}` : '0'} Pkt
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-muted-2">{STATUS_LABEL[entry.status]}</span>
        <span className="flex-1" />
        {/* Der Ausweg für hängengebliebene Abstimmungen -- etwa wenn nach dem Entfernen
            einer Person nie genug Stimmen zusammenkommen. */}
        {entry.status !== 'APPROVED' && (
          <ConfirmActionButton
            action={setPenaltyEntryStatus.bind(null, entry.id, 'APPROVED')}
            label="Bestätigen"
            confirmLabel="Wirklich?"
            tone="neutral"
          />
        )}
        {entry.status !== 'REJECTED' && (
          <ConfirmActionButton
            action={setPenaltyEntryStatus.bind(null, entry.id, 'REJECTED')}
            label={isOpen ? 'Ablehnen' : 'Aufheben'}
            confirmLabel="Wirklich?"
            tone="neutral"
          />
        )}
        <ConfirmActionButton
          action={deletePenaltyEntryAsAdmin.bind(null, entry.id)}
          label="Löschen"
          confirmLabel="Löschen?"
          icon={<TrashIcon className="h-3.5 w-3.5" />}
        />
      </div>
    </div>
  )
}

export function PenaltyEntryAdminList({ entries }: { entries: AdminPenaltyEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-1">Noch keine Strafen eingetragen.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((e) => (
        <EntryRow key={e.id} entry={e} />
      ))}
    </div>
  )
}
