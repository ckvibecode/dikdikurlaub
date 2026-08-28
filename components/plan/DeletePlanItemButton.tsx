'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { deletePlanItem } from '@/lib/actions/plan-actions'
import { TrashIcon } from '@/components/icons'

/** Wie lange der scharfgeschaltete Loeschen-Button bestaetigungsbereit bleibt. */
const ARM_TIMEOUT_MS = 3000

export function DeletePlanItemButton({ planItemId, title }: { planItemId: string; title: string }) {
  const [pending, startTransition] = useTransition()
  // Zwei-Stufen-Loeschen: ein Tap loeschte bisher sofort einen Programmpunkt der ganzen
  // Gruppe und stornierte allen Teilnehmern die Punkte. Kein Modal — die App wird
  // einhaendig, im Sonnenlicht und nach ein paar Drinks bedient.
  const [armed, setArmed] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearResetTimer() {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current)
      resetTimer.current = null
    }
  }

  useEffect(() => clearResetTimer, [])

  function handleClick() {
    if (armed) {
      clearResetTimer()
      setArmed(false)
      startTransition(() => deletePlanItem(planItemId))
      return
    }
    setArmed(true)
    resetTimer.current = setTimeout(() => setArmed(false), ARM_TIMEOUT_MS)
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      aria-label={armed ? `${title} wirklich löschen` : `${title} löschen`}
      className={`flex h-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
        armed
          ? 'gap-1.5 border border-danger/45 bg-danger/12 px-3.5 text-sm font-semibold text-danger'
          : 'w-11 text-muted-2 hover:bg-white/[0.06] hover:text-danger'
      }`}
    >
      <TrashIcon className="h-4 w-4 shrink-0" />
      {armed && <span>Löschen?</span>}
    </button>
  )
}
