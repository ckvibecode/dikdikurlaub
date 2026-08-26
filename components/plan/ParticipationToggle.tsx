'use client'

import { useTransition } from 'react'
import { toggleParticipation } from '@/lib/actions/plan-actions'
import { CheckIcon } from '@/components/icons'

export function ParticipationToggle({ planItemId, joined }: { planItemId: string; joined: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleParticipation(planItemId))}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
        joined
          ? 'bg-accent-lime text-background'
          : 'border border-white/15 bg-transparent text-muted-1 hover:border-accent-lime/50 hover:text-accent-lime'
      }`}
    >
      {joined && <CheckIcon className="h-3.5 w-3.5" />}
      {joined ? 'Dabei' : 'Bin dabei?'}
    </button>
  )
}
