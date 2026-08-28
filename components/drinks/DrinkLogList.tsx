'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { deleteDrink } from '@/lib/actions/drink-actions'
import { TrashIcon } from '@/components/icons'

/** Wie lange der scharfgeschaltete Loeschen-Button bestaetigungsbereit bleibt. */
const ARM_TIMEOUT_MS = 3000

export interface DrinkLogEntry {
  id: string
  categoryLabel: string
  points: number
  time: string
}

export function DrinkLogList({ entries }: { entries: DrinkLogEntry[] }) {
  const [pending, startTransition] = useTransition()
  // Zwei-Stufen-Loeschen: der erste Tap schaltet scharf, der zweite loescht. Kein Modal —
  // die App wird einhaendig, im Sonnenlicht und nach ein paar Drinks bedient.
  const [armedId, setArmedId] = useState<string | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearResetTimer() {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current)
      resetTimer.current = null
    }
  }

  useEffect(() => clearResetTimer, [])

  function handleClick(id: string) {
    if (armedId === id) {
      clearResetTimer()
      setArmedId(null)
      startTransition(() => deleteDrink(id))
      return
    }
    clearResetTimer()
    setArmedId(id)
    resetTimer.current = setTimeout(() => setArmedId(null), ARM_TIMEOUT_MS)
  }

  if (entries.length === 0) {
    return <p className="text-sm text-muted-2">Noch nichts geloggt.</p>
  }

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map((entry) => {
        const armed = armedId === entry.id
        // Bei mehreren gleichen Getraenken unterscheidet erst die Uhrzeit die Buttons.
        const target = `${entry.categoryLabel} von ${entry.time}`

        return (
          <div key={entry.id} className="flex items-center gap-3 rounded-xl px-1 py-0.5">
            <span className="font-mono text-[11px] tabular-nums text-muted-2">{entry.time}</span>
            <span className="flex-1 truncate text-sm font-semibold text-foreground">
              {entry.categoryLabel}
            </span>
            {!armed && (
              <span className="font-mono text-[11px] tabular-nums text-muted-1">
                +{entry.points} Pkt
              </span>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => handleClick(entry.id)}
              aria-label={armed ? `${target} wirklich entfernen` : `${target} entfernen`}
              className={`flex h-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
                armed
                  ? 'gap-1.5 border border-danger/45 bg-danger/12 px-3.5 text-[13px] font-semibold text-danger'
                  : 'w-11 text-muted-2 hover:bg-white/[0.06] hover:text-danger'
              }`}
            >
              <TrashIcon className="h-4 w-4 shrink-0" />
              {armed && <span>Löschen?</span>}
            </button>
          </div>
        )
      })}
    </div>
  )
}
