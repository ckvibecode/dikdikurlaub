'use client'

import { useActionState, useState, useTransition } from 'react'
import { addPenaltyType, deletePenaltyType, type ActionState } from '@/lib/actions/penalty-actions'
import { Button } from '@/components/ui/Button'
import { TrashIcon } from '@/components/icons'

const initialState: ActionState = {}

export interface CatalogEntry {
  id: string
  title: string
  consequence: string
  points: number
}

export function PenaltyTypeAdmin({ penaltyTypes }: { penaltyTypes: CatalogEntry[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(addPenaltyType, initialState)
  const [deletePending, startDeleteTransition] = useTransition()

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-member/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-member">Admin: Strafenkatalog</p>

      {penaltyTypes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {penaltyTypes.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{p.title}</p>
                <p className="text-[11px] text-muted-2">{p.consequence}</p>
              </div>
              {p.points > 0 && <span className="font-mono text-[11px] text-danger">-{p.points} Pkt</span>}
              <button
                type="button"
                disabled={deletePending}
                onClick={() => startDeleteTransition(() => deletePenaltyType(p.id))}
                aria-label={`${p.title} entfernen`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-2 transition-colors hover:bg-white/[0.06] hover:text-danger disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="self-start text-xs font-semibold text-member">
          + Permanente Strafe hinzufügen
        </button>
      )}

      {open && (
        <form action={formAction} className="flex flex-col gap-2.5">
          <input
            type="text"
            name="title"
            placeholder="z.B. Handy verloren"
            required
            maxLength={60}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60"
          />
          <input
            type="text"
            name="consequence"
            placeholder="Konsequenz, z.B. Gibt eine Runde aus"
            required
            maxLength={100}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60"
          />
          <label>
            <span className="mb-1 block text-[11px] font-medium text-muted-2">Minuspunkte (optional)</span>
            <input
              type="number"
              name="points"
              min={0}
              max={50}
              defaultValue={0}
              className="w-24 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60"
            />
          </label>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" disabled={pending} className="flex-1">
              {pending ? 'Anlegen...' : 'Anlegen'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
