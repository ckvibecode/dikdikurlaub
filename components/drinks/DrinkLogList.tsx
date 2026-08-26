'use client'

import { useTransition } from 'react'
import { deleteDrink } from '@/lib/actions/drink-actions'
import { TrashIcon } from '@/components/icons'

export interface DrinkLogEntry {
  id: string
  categoryLabel: string
  points: number
  time: string
}

export function DrinkLogList({ entries }: { entries: DrinkLogEntry[] }) {
  const [pending, startTransition] = useTransition()

  if (entries.length === 0) {
    return <p className="text-sm text-muted-2">Noch nichts geloggt.</p>
  }

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-3 rounded-xl px-1 py-1.5">
          <span className="font-mono text-[11px] text-muted-2">{entry.time}</span>
          <span className="flex-1 text-sm font-semibold text-foreground">{entry.categoryLabel}</span>
          <span className="font-mono text-[11px] text-muted-1">+{entry.points} Pkt</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => deleteDrink(entry.id))}
            aria-label={`${entry.categoryLabel} entfernen`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-2 transition-colors hover:bg-white/[0.06] hover:text-[#ff6f6f] disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
