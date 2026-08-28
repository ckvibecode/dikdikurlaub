'use client'

import { useState, useTransition } from 'react'
import { recalculatePoints, type ActionState } from '@/lib/actions/admin-actions'
import { Button } from '@/components/ui/Button'
import { ActionFeedback } from '@/components/admin/ActionFeedback'

/** Rechnet den Punkte-Cache aller Mitglieder aus dem Ledger neu. Ungefährlich und
 * wiederholbar, deshalb ohne Bestätigungsschritt. */
export function RecalculatePointsButton() {
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<ActionState>({})

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setState(await recalculatePoints())
          })
        }
        className="self-start"
      >
        {pending ? 'Rechne…' : 'Punkte neu berechnen'}
      </Button>
      <ActionFeedback state={state} />
    </div>
  )
}
