'use client'

import { useActionState } from 'react'
import { updateTrip, type ActionState } from '@/lib/actions/admin-actions'
import { ADMIN_FIELD, ADMIN_LABEL } from '@/lib/field-styles'
import { Button } from '@/components/ui/Button'
import { ActionFeedback } from '@/components/admin/ActionFeedback'

const initialState: ActionState = {}

export function TripSettingsForm({
  name,
  startDate,
  endDate,
}: {
  name: string
  /** Bereits als 'YYYY-MM-DD' geliefert -- die Umrechnung gehört auf den Server. */
  startDate: string
  endDate: string
}) {
  const [state, formAction, pending] = useActionState(updateTrip, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label>
        <span className={ADMIN_LABEL}>Trip-Name</span>
        <input
          type="text"
          name="name"
          defaultValue={name}
          required
          maxLength={40}
          className={`${ADMIN_FIELD} w-full`}
        />
      </label>

      <div className="grid grid-cols-2 gap-2.5">
        <label>
          <span className={ADMIN_LABEL}>Start</span>
          <input type="date" name="startDate" defaultValue={startDate} required className={`${ADMIN_FIELD} w-full`} />
        </label>
        <label>
          <span className={ADMIN_LABEL}>Ende</span>
          <input type="date" name="endDate" defaultValue={endDate} required className={`${ADMIN_FIELD} w-full`} />
        </label>
      </div>

      <ActionFeedback state={state} />

      <Button type="submit" variant="secondary" disabled={pending} className="self-start">
        {pending ? 'Speichern…' : 'Speichern'}
      </Button>
    </form>
  )
}
