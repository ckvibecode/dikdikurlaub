'use client'

import { useTransition } from 'react'
import { toggleParticipation } from '@/lib/actions/plan-actions'
import { CheckIcon } from '@/components/icons'

export function ParticipationToggle({
  planItemId,
  joined,
  itemTitle,
}: {
  planItemId: string
  joined: boolean
  /** Ohne den Titel heissen auf einer Seite alle Toggles gleich und sind im
   *  Screenreader nicht auseinanderzuhalten. */
  itemTitle?: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={joined}
      aria-label={itemTitle ? `Dabei bei ${itemTitle}` : undefined}
      onClick={() => startTransition(() => toggleParticipation(planItemId))}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
        joined
          ? 'bg-member text-background'
          : 'border border-white/15 bg-transparent text-muted-1 hover:border-member/50 hover:text-member'
      }`}
    >
      {joined && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
      {joined ? 'Dabei' : 'Bin dabei?'}
    </button>
  )
}
