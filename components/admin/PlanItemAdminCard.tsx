'use client'

import { useActionState, useState } from 'react'
import {
  updatePlanItem,
  deletePlanItemAsAdmin,
  removeParticipationAsAdmin,
  type ActionState,
} from '@/lib/actions/admin-actions'
import { MAX_PLAN_ITEM_POINTS } from '@/lib/plan'
import { getAvatarHex } from '@/lib/avatar'
import { ADMIN_FIELD, ADMIN_LABEL } from '@/lib/field-styles'
import { Button } from '@/components/ui/Button'
import { ConfirmActionButton } from '@/components/admin/ConfirmActionButton'
import { ActionFeedback } from '@/components/admin/ActionFeedback'
import { TrashIcon } from '@/components/icons'

const initialState: ActionState = {}

export interface AdminPlanParticipant {
  completionId: string
  name: string
  avatar: string
}

export interface AdminPlanItem {
  id: string
  /** 'YYYY-MM-DD' -- serverseitig aus dem DateTime abgeleitet. */
  day: string
  startTime: string | null
  endTime: string | null
  title: string
  description: string | null
  points: number
  createdByName: string
  participants: AdminPlanParticipant[]
}

export function PlanItemAdminCard({ item }: { item: AdminPlanItem }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(updatePlanItem, initialState)

  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      {editing ? (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="planItemId" value={item.id} />

          <input
            type="text"
            name="title"
            defaultValue={item.title}
            required
            maxLength={80}
            aria-label="Titel"
            className={`${ADMIN_FIELD} w-full`}
          />
          <textarea
            name="description"
            defaultValue={item.description ?? ''}
            rows={2}
            maxLength={300}
            placeholder="Beschreibung (optional)"
            aria-label="Beschreibung"
            className={`${ADMIN_FIELD} w-full`}
          />

          <label>
            <span className={ADMIN_LABEL}>Tag</span>
            <input type="date" name="day" defaultValue={item.day} required className={`${ADMIN_FIELD} w-full`} />
          </label>

          <div className="grid grid-cols-3 gap-2">
            <label>
              <span className={ADMIN_LABEL}>Von</span>
              <input type="time" name="startTime" defaultValue={item.startTime ?? ''} className={`${ADMIN_FIELD} w-full`} />
            </label>
            <label>
              <span className={ADMIN_LABEL}>Bis</span>
              <input type="time" name="endTime" defaultValue={item.endTime ?? ''} className={`${ADMIN_FIELD} w-full`} />
            </label>
            <label>
              <span className={ADMIN_LABEL}>Punkte</span>
              <input
                type="number"
                name="points"
                defaultValue={item.points}
                min={0}
                max={MAX_PLAN_ITEM_POINTS}
                className={`${ADMIN_FIELD} w-full`}
              />
            </label>
          </div>

          {item.participants.length > 0 && (
            <p className="text-[11px] leading-relaxed text-muted-2">
              Eine geänderte Punktzahl wird bei allen {item.participants.length} Zusagen sofort
              nachgebucht.
            </p>
          )}

          <ActionFeedback state={state} />

          <div className="flex gap-2">
            <Button type="submit" variant="secondary" disabled={pending} className="flex-1 py-2 text-xs">
              {pending ? 'Speichern…' : 'Speichern'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="py-2 text-xs">
              Fertig
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-2">
                {item.startTime ? `${item.startTime}${item.endTime ? `–${item.endTime}` : ''} · ` : ''}
                {item.points > 0 ? `${item.points} Pkt · ` : ''}
                von {item.createdByName}
              </p>
              {item.description && (
                <p className="mt-1 text-[11px] leading-relaxed text-muted-2">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-muted-1 transition-colors hover:text-foreground"
            >
              Ändern
            </button>
            <ConfirmActionButton
              action={deletePlanItemAsAdmin.bind(null, item.id)}
              label="Löschen"
              confirmLabel="Löschen?"
              icon={<TrashIcon className="h-3.5 w-3.5" />}
            />
          </div>

          {item.participants.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-white/[0.06] pt-2.5">
              <span className="text-[11px] text-muted-2">Dabei:</span>
              {item.participants.map((p) => (
                <ConfirmActionButton
                  key={p.completionId}
                  action={removeParticipationAsAdmin.bind(null, p.completionId)}
                  label={p.name}
                  confirmLabel={`${p.name} austragen?`}
                  tone="danger"
                  icon={
                    <span
                      aria-hidden
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: getAvatarHex(p.avatar) }}
                    />
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
