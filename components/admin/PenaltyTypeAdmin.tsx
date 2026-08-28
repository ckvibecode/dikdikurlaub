'use client'

import { useActionState, useState } from 'react'
import {
  addPenaltyType,
  updatePenaltyType,
  setPenaltyTypeActive,
  type ActionState,
} from '@/lib/actions/admin-actions'
import { ADMIN_FIELD, ADMIN_LABEL } from '@/lib/field-styles'
import { Button } from '@/components/ui/Button'
import { ConfirmActionButton } from '@/components/admin/ConfirmActionButton'
import { ActionFeedback } from '@/components/admin/ActionFeedback'

const initialState: ActionState = {}

export interface AdminPenaltyType {
  id: string
  title: string
  consequence: string
  points: number
  isActive: boolean
  entryCount: number
}

function TypeRow({ type }: { type: AdminPenaltyType }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(updatePenaltyType, initialState)

  return (
    <div className={`rounded-xl bg-white/[0.03] p-3 ${type.isActive ? '' : 'opacity-55'}`}>
      {editing ? (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="penaltyTypeId" value={type.id} />
          <input
            type="text"
            name="title"
            defaultValue={type.title}
            required
            maxLength={60}
            aria-label="Titel"
            className={`${ADMIN_FIELD} w-full`}
          />
          <input
            type="text"
            name="consequence"
            defaultValue={type.consequence}
            required
            maxLength={100}
            aria-label="Konsequenz"
            className={`${ADMIN_FIELD} w-full`}
          />
          <label>
            <span className={ADMIN_LABEL}>Minuspunkte</span>
            <input
              type="number"
              name="points"
              defaultValue={type.points}
              min={0}
              max={50}
              className={`${ADMIN_FIELD} w-24`}
            />
          </label>
          <ActionFeedback state={state} />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" disabled={pending} className="px-4 py-2 text-xs">
              {pending ? 'Speichern…' : 'Speichern'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="px-4 py-2 text-xs">
              Fertig
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {type.title}
              {!type.isActive && <span className="ml-1.5 text-[11px] text-muted-2">(inaktiv)</span>}
            </p>
            <p className="truncate text-[11px] text-muted-2">{type.consequence}</p>
            <p className="text-[11px] text-muted-2">
              {type.points > 0 ? `−${type.points} Pkt` : 'ohne Punkte'} · {type.entryCount}× vergeben
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-muted-1 transition-colors hover:text-foreground"
          >
            Ändern
          </button>
          <ConfirmActionButton
            action={setPenaltyTypeActive.bind(null, type.id, !type.isActive)}
            label={type.isActive ? 'Aus' : 'An'}
            confirmLabel={type.isActive ? 'Ausblenden?' : 'Einblenden?'}
            tone={type.isActive ? 'danger' : 'neutral'}
          />
        </div>
      )}
    </div>
  )
}

export function PenaltyTypeAdmin({ types }: { types: AdminPenaltyType[] }) {
  const [adding, setAdding] = useState(false)
  const [state, formAction, pending] = useActionState(addPenaltyType, initialState)

  return (
    <div className="flex flex-col gap-2">
      {types.map((t) => (
        <TypeRow key={t.id} type={t} />
      ))}

      {adding ? (
        <form action={formAction} className="flex flex-col gap-2 rounded-xl border border-dashed border-member/30 p-3">
          <input type="text" name="title" placeholder="z.B. Handy verloren" required maxLength={60} className={`${ADMIN_FIELD} w-full`} />
          <input
            type="text"
            name="consequence"
            placeholder="Konsequenz, z.B. Gibt eine Runde aus"
            required
            maxLength={100}
            className={`${ADMIN_FIELD} w-full`}
          />
          <label>
            <span className={ADMIN_LABEL}>Minuspunkte (optional)</span>
            <input type="number" name="points" defaultValue={0} min={0} max={50} className={`${ADMIN_FIELD} w-24`} />
          </label>
          <ActionFeedback state={state} />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" disabled={pending} className="flex-1 py-2 text-xs">
              {pending ? 'Anlegen…' : 'Anlegen'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)} className="py-2 text-xs">
              Abbrechen
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex min-h-11 items-center self-start text-xs font-semibold text-member"
        >
          + Katalog-Strafe hinzufügen
        </button>
      )}
    </div>
  )
}
