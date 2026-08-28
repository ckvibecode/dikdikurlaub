'use client'

import { useActionState } from 'react'
import { logCatalogPenalty, type ActionState } from '@/lib/actions/penalty-actions'
import { Button } from '@/components/ui/Button'

const initialState: ActionState = {}

export function LogCatalogPenaltyForm({
  members,
  penaltyTypes,
}: {
  members: Array<{ id: string; name: string }>
  penaltyTypes: Array<{ id: string; title: string; consequence: string; points: number }>
}) {
  const [state, formAction, pending] = useActionState(logCatalogPenalty, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-surface p-4">
      <p className="text-sm font-bold text-foreground">Katalog-Strafe eintragen</p>
      <select
        name="targetMemberId"
        required
        defaultValue=""
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60"
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
      <select
        name="penaltyTypeId"
        required
        defaultValue=""
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60"
      >
        <option value="" disabled>
          Welche Strafe?
        </option>
        {penaltyTypes.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title} &rarr; {p.consequence}
            {p.points > 0 ? ` (-${p.points} Pkt)` : ''}
          </option>
        ))}
      </select>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? 'Eintragen...' : 'Eintragen'}
      </Button>
    </form>
  )
}
