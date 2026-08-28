'use client'

import { useActionState, useState } from 'react'
import { addPlanItem, type ActionState } from '@/lib/actions/plan-actions'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@/components/icons'

const initialState: ActionState = {}

export function AddPlanItemForm({ defaultDay }: { defaultDay: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(addPlanItem, initialState)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 px-4 py-3.5 text-sm font-semibold text-muted-1 transition-colors hover:border-member/40 hover:text-member"
      >
        <PlusIcon className="h-4 w-4" />
        Programmpunkt hinzufügen
      </button>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-surface p-4">
      <input
        type="date"
        name="day"
        defaultValue={defaultDay}
        required
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60"
      />
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-[11px] font-medium text-muted-2">Start</span>
          <input
            type="time"
            name="startTime"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60"
          />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-[11px] font-medium text-muted-2">Ende</span>
          <input
            type="time"
            name="endTime"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60"
          />
        </label>
      </div>
      <input
        type="text"
        name="title"
        placeholder="Was steht an?"
        required
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60"
      />
      <input
        type="text"
        name="description"
        placeholder="Details (optional)"
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60"
      />
      <label>
        <span className="mb-1 block text-[11px] font-medium text-muted-2">Punkte bei Teilnahme (optional)</span>
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
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? 'Speichern...' : 'Hinzufügen'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
