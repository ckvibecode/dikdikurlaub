'use client'

import { useActionState, useState } from 'react'
import { proposeSpontaneousPenalty, type ActionState } from '@/lib/actions/penalty-actions'
import { Button } from '@/components/ui/Button'
import { MIN_VOTES_TO_APPROVE } from '@/lib/penalties'

const initialState: ActionState = {}

export function ProposeSpontaneousForm({ members }: { members: Array<{ id: string; name: string }> }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(proposeSpontaneousPenalty, initialState)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/10 bg-surface px-4 py-2.5 text-sm font-semibold text-muted-1"
      >
        + Spontane Strafe vorschlagen
      </button>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-surface p-4">
      <div>
        <p className="text-sm font-bold text-foreground">Spontane Strafe vorschlagen</p>
        <p className="mt-0.5 text-xs text-muted-2">
          Braucht mindestens {MIN_VOTES_TO_APPROVE} Bestätigungen aus der Gruppe, um durchgesetzt zu werden.
        </p>
      </div>
      <select
        name="targetMemberId"
        required
        defaultValue=""
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-accent-lime/60"
      >
        <option value="" disabled>
          Wer war&apos;s?
        </option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="freeTitle"
        placeholder="Was ist passiert?"
        required
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-accent-lime/60"
      />
      <input
        type="text"
        name="freeConsequence"
        placeholder="Vorgeschlagene Strafe"
        required
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-accent-lime/60"
      />
      <label>
        <span className="mb-1 block text-[11px] font-medium text-muted-2">Minuspunkte (optional)</span>
        <input
          type="number"
          name="points"
          min={0}
          max={50}
          defaultValue={0}
          className="w-24 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-accent-lime/60"
        />
      </label>
      {state?.error && <p className="text-sm text-[#ff6f6f]">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? 'Vorschlagen...' : 'Zur Abstimmung stellen'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
