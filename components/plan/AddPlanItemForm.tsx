'use client'

import { useActionState, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { addPlanItem, type ActionState } from '@/lib/actions/plan-actions'
import { MAX_PLAN_ITEM_POINTS } from '@/lib/plan'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@/components/icons'

const initialState: ActionState = {}

const FIELD =
  'w-full min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-member/60'
const LABEL = 'mb-1 block text-[11px] font-medium text-muted-2'

/** Nur fuer Screenreader; `sr-only` wird im Projekt sonst nicht verwendet und daher nicht
 *  zuverlaessig generiert. */
const VISUALLY_HIDDEN: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
}

export function AddPlanItemForm({ defaultDay }: { defaultDay: string }) {
  const [state, formAction, pending] = useActionState(addPlanItem, initialState)
  // Offen/geschlossen wird abgeleitet statt gespeichert: das Formular haelt sich offen,
  // solange keine neue Karte entstanden ist (oder ein Fehler noch aussteht), und schliesst
  // sich beim Erfolg von selbst. Damit kommt der Ablauf ohne setState im Effect aus.
  const [openRequest, setOpenRequest] = useState<{ since?: string } | null>(null)
  const [dismissed, setDismissed] = useState<string | undefined>(undefined)
  const formRef = useRef<HTMLFormElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const id = useId()

  const open =
    openRequest !== null && (Boolean(state.error) || state.createdId === openRequest.since)
  const confirmation =
    !open && state.createdTitle && state.createdId !== dismissed
      ? `„${state.createdTitle}" steht im Plan.`
      : ''

  // Beim Oeffnen ins Formular scrollen und den Titel fokussieren: vorher fiel der Fokus auf
  // <body> und vom Formular waren nur rund 40px sichtbar.
  useEffect(() => {
    if (!open) return
    formRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    titleRef.current?.focus()
  }, [open])

  // Nach dem Anlegen zur neuen Karte springen — sie erscheint sonst irgendwo oberhalb des
  // sichtbaren Bereichs.
  useEffect(() => {
    if (!state.createdId) return
    document
      .getElementById(`plan-item-${state.createdId}`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [state.createdId])

  return (
    <div className="flex flex-col gap-2">
      {open ? (
        <form
          ref={formRef}
          action={formAction}
          aria-labelledby={`${id}-heading`}
          className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-surface p-4"
        >
          <h2 id={`${id}-heading`} className="text-sm font-bold text-foreground">
            Neuer Programmpunkt
          </h2>

          <div>
            <label className={LABEL} htmlFor={`${id}-title`}>
              Titel <span aria-hidden="true">*</span>
            </label>
            <input
              ref={titleRef}
              id={`${id}-title`}
              type="text"
              name="title"
              required
              placeholder="Was steht an?"
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor={`${id}-description`}>
              Details
            </label>
            <input
              id={`${id}-description`}
              type="text"
              name="description"
              placeholder="Treffpunkt, was mitbringen, Dresscode …"
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor={`${id}-day`}>
              Tag <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${id}-day`}
              type="date"
              name="day"
              defaultValue={defaultDay}
              required
              className={FIELD}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className={LABEL} htmlFor={`${id}-start`}>
                Start
              </label>
              <input id={`${id}-start`} type="time" name="startTime" className={FIELD} />
            </div>
            <div className="flex-1">
              <label className={LABEL} htmlFor={`${id}-end`}>
                Ende
              </label>
              <input id={`${id}-end`} type="time" name="endTime" className={FIELD} />
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor={`${id}-points`}>
              Punkte bei Teilnahme (0–{MAX_PLAN_ITEM_POINTS})
            </label>
            <input
              id={`${id}-points`}
              type="number"
              name="points"
              min={0}
              max={MAX_PLAN_ITEM_POINTS}
              defaultValue={0}
              className={`${FIELD} w-24`}
            />
          </div>

          <p className="text-[11px] text-muted-2">
            <span aria-hidden="true">*</span> Pflichtfeld
          </p>

          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? 'Speichern...' : 'Hinzufügen'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDismissed(state.createdId)
                setOpenRequest(null)
              }}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDismissed(state.createdId)
            setOpenRequest({ since: state.createdId })
          }}
          className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 px-4 py-3.5 text-sm font-semibold text-muted-1 transition-colors hover:border-member/40 hover:text-member"
        >
          <PlusIcon className="h-4 w-4" />
          Programmpunkt hinzufügen
        </button>
      )}

      {confirmation && <p className="text-sm text-muted-1">{confirmation}</p>}

      <span role="status" style={VISUALLY_HIDDEN}>
        {confirmation}
      </span>
    </div>
  )
}
