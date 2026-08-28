'use client'

import { useActionState, useState } from 'react'
import {
  addDrinkCategory,
  updateDrinkCategory,
  setDrinkCategoryActive,
  type ActionState,
} from '@/lib/actions/admin-actions'
import { ADMIN_FIELD, ADMIN_LABEL } from '@/lib/field-styles'
import { Button } from '@/components/ui/Button'
import { ConfirmActionButton } from '@/components/admin/ConfirmActionButton'
import { ActionFeedback } from '@/components/admin/ActionFeedback'

const initialState: ActionState = {}

export interface AdminDrinkCategory {
  id: string
  label: string
  points: number
  isDefault: boolean
  isActive: boolean
  entryCount: number
}

function CategoryRow({ category }: { category: AdminDrinkCategory }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(updateDrinkCategory, initialState)

  return (
    <div className={`rounded-xl bg-white/[0.03] p-3 ${category.isActive ? '' : 'opacity-55'}`}>
      {editing ? (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="categoryId" value={category.id} />
          <div className="flex gap-2">
            <input
              type="text"
              name="label"
              defaultValue={category.label}
              required
              maxLength={30}
              className={`${ADMIN_FIELD} min-w-0 flex-1`}
            />
            <input
              type="number"
              name="points"
              defaultValue={category.points}
              min={0}
              max={20}
              aria-label="Punkte"
              className={`${ADMIN_FIELD} w-20 shrink-0`}
            />
          </div>
          <ActionFeedback state={state} />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" disabled={pending} className="px-4 py-2 text-xs">
              {pending ? 'Speichern…' : 'Speichern'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-xs"
            >
              Fertig
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {category.label}
              {!category.isActive && <span className="ml-1.5 text-[11px] text-muted-2">(inaktiv)</span>}
            </p>
            <p className="text-[11px] text-muted-2">
              {category.points} Pkt · {category.entryCount}× geloggt
              {category.isDefault && ' · Standard'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-muted-1 transition-colors hover:text-foreground"
          >
            Ändern
          </button>
          {/* Standard-Kategorien bleiben immer verfügbar -- sonst könnte der Getränke-Screen
              leer laufen. Eigene werden nur deaktiviert, damit geloggte Getränke bleiben. */}
          {!category.isDefault && (
            <ConfirmActionButton
              action={setDrinkCategoryActive.bind(null, category.id, !category.isActive)}
              label={category.isActive ? 'Aus' : 'An'}
              confirmLabel={category.isActive ? 'Ausblenden?' : 'Einblenden?'}
              tone={category.isActive ? 'danger' : 'neutral'}
            />
          )}
        </div>
      )}
    </div>
  )
}

export function DrinkCategoryAdmin({ categories }: { categories: AdminDrinkCategory[] }) {
  const [adding, setAdding] = useState(false)
  const [state, formAction, pending] = useActionState(addDrinkCategory, initialState)

  return (
    <div className="flex flex-col gap-2">
      {categories.map((c) => (
        <CategoryRow key={c.id} category={c} />
      ))}

      {adding ? (
        <form action={formAction} className="flex flex-col gap-2 rounded-xl border border-dashed border-member/30 p-3">
          <label>
            <span className={ADMIN_LABEL}>Name</span>
            <input type="text" name="label" placeholder="z.B. Longdrink" required maxLength={30} className={`${ADMIN_FIELD} w-full`} />
          </label>
          <label>
            <span className={ADMIN_LABEL}>Punkte pro Getränk</span>
            <input type="number" name="points" defaultValue={1} min={0} max={20} className={`${ADMIN_FIELD} w-24`} />
          </label>
          <ActionFeedback state={state} />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" disabled={pending} className="flex-1 py-2 text-xs">
              {pending ? 'Anlegen…' : 'Anlegen'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)} className="py-2 text-xs">
              Abbrechen
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex min-h-11 items-center self-start text-xs font-semibold text-member"
        >
          + Kategorie hinzufügen
        </button>
      )}
    </div>
  )
}
