'use client'

import { useTransition } from 'react'
import { deletePlanItem } from '@/lib/actions/plan-actions'
import { TrashIcon } from '@/components/icons'

export function DeletePlanItemButton({ planItemId, title }: { planItemId: string; title: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => deletePlanItem(planItemId))}
      aria-label={`${title} löschen`}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-2 transition-colors hover:bg-white/[0.06] hover:text-[#ff6f6f] disabled:opacity-50"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  )
}
