'use client'

import { useActionState, useState, useTransition } from 'react'
import { addDrinkCategory, deleteDrinkCategory, type ActionState } from '@/lib/actions/drink-actions'
import { Button } from '@/components/ui/Button'
import { TrashIcon } from '@/components/icons'

const initialState: ActionState = {}

export interface CustomDrinkCategory {
  id: string
  label: string
  points: number
}

export function DrinkCategoryAdmin({ customCategories }: { customCategories: CustomDrinkCategory[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(addDrinkCategory, initialState)
  const [deletePending, startDeleteTransition] = useTransition()

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-accent-violet/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#a99cff]">Admin: Getränke-Kategorien</p>

      {customCategories.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {customCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
              <span className="flex-1 text-sm font-semibold text-foreground">{cat.label}</span>
              <span className="font-mono text-[11px] text-muted-1">+{cat.points} Pkt</span>
              <button
                type="button"
                disabled={deletePending}
                onClick={() => startDeleteTransition(() => deleteDrinkCategory(cat.id))}
                aria-label={`${cat.label} entfernen`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-2 transition-colors hover:bg-white/[0.06] hover:text-[#ff6f6f] disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="self-start text-xs font-semibold text-[#a99cff]"
        >
          + Neue Kategorie hinzufügen
        </button>
      )}

      {open && (
        <form action={formAction} className="flex flex-col gap-2.5">
          <div className="flex gap-2">
            <input
              type="text"
              name="label"
              placeholder="z.B. Sekt"
              required
              maxLength={20}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-accent-violet/60"
            />
            <input
              type="number"
              name="points"
              placeholder="Pkt"
              min={0}
              max={20}
              required
              className="w-20 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-accent-violet/60"
            />
          </div>
          {state?.error && <p className="text-sm text-[#ff6f6f]">{state.error}</p>}
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
