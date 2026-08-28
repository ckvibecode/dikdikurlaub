'use client'

import { useActionState, useState } from 'react'
import {
  updateDrinkEntryQuantity,
  deleteDrinkEntryAsAdmin,
  type ActionState,
} from '@/lib/actions/admin-actions'
import { MAX_DRINK_QUANTITY } from '@/lib/admin-limits'
import { getAvatarHex } from '@/lib/avatar'
import { ADMIN_FIELD } from '@/lib/field-styles'
import { ConfirmActionButton } from '@/components/admin/ConfirmActionButton'
import { ActionFeedback } from '@/components/admin/ActionFeedback'
import { TrashIcon } from '@/components/icons'

const initialState: ActionState = {}

export interface AdminDrinkEntry {
  id: string
  memberName: string
  memberAvatar: string
  categoryLabel: string
  quantity: number
  /** Serverseitig formatiert -- der Trip hat eine feste Zeitzone, das Gerät nicht. */
  when: string
}

function EntryRow({ entry }: { entry: AdminDrinkEntry }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(updateDrinkEntryQuantity, initialState)
  const hex = getAvatarHex(entry.memberAvatar)

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white/[0.03] p-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-background"
          style={{ backgroundColor: hex }}
        >
          {entry.memberName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {entry.memberName} · {entry.categoryLabel}
            {entry.quantity > 1 && <span className="text-member"> ×{entry.quantity}</span>}
          </p>
          <p className="text-[11px] text-muted-2">{entry.when}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-muted-1 transition-colors hover:text-foreground"
        >
          Menge
        </button>
        <ConfirmActionButton
          action={deleteDrinkEntryAsAdmin.bind(null, entry.id)}
          label="Löschen"
          confirmLabel="Löschen?"
          icon={<TrashIcon className="h-3.5 w-3.5" />}
        />
      </div>

      {editing && (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="entryId" value={entry.id} />
          <div className="flex gap-2">
            <input
              type="number"
              name="quantity"
              defaultValue={entry.quantity}
              min={1}
              max={MAX_DRINK_QUANTITY}
              aria-label="Menge"
              className={`${ADMIN_FIELD} w-24 shrink-0`}
            />
            <button
              type="submit"
              disabled={pending}
              className="shrink-0 rounded-xl border border-member/45 px-3 text-xs font-semibold text-member disabled:opacity-50"
            >
              {pending ? '…' : 'Speichern'}
            </button>
          </div>
          <ActionFeedback state={state} />
        </form>
      )}
    </div>
  )
}

export function DrinkEntryAdminList({ entries }: { entries: AdminDrinkEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-1">Noch keine Getränke geloggt.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((e) => (
        <EntryRow key={e.id} entry={e} />
      ))}
    </div>
  )
}
