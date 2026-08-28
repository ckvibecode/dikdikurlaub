'use client'

import { useEffect, useState, useTransition } from 'react'
import { logDrink } from '@/lib/actions/drink-actions'
import { PlusIcon, LockIcon } from '@/components/icons'

export interface DrinkCategoryOption {
  id: string
  label: string
  points: number
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function DrinkCounterGrid({
  categories,
  opensAtMs,
  initiallyLocked,
  opensAtLabel,
}: {
  categories: DrinkCategoryOption[]
  opensAtMs: number
  initiallyLocked: boolean
  opensAtLabel: string
}) {
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [locked, setLocked] = useState(initiallyLocked)
  // Bleibt bis nach der Hydration null, damit Server- und Client-Markup identisch sind.
  const [remaining, setRemaining] = useState<string | null>(null)

  useEffect(() => {
    const tick = () => {
      const diff = opensAtMs - Date.now()
      setLocked(diff > 0)
      setRemaining(diff > 0 ? formatRemaining(diff) : null)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [opensAtMs])

  function handleLog(categoryId: string) {
    // Bewusst kein `disabled` waehrend des Requests: das raeumt den Fokus auf <body> ab und
    // sperrt alle vier Kacheln gleichzeitig. Doppeltipps auf dieselbe Kachel werden
    // stattdessen hier verworfen, die uebrigen Kacheln bleiben bedienbar.
    if (pendingIds.includes(categoryId)) return
    setError(null)
    setPendingIds((ids) => [...ids, categoryId])
    startTransition(async () => {
      const result = await logDrink(categoryId)
      setPendingIds((ids) => ids.filter((id) => id !== categoryId))
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-2.5">
      {locked && (
        <p className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-muted-1">
          <LockIcon className="h-4 w-4 shrink-0 text-muted-2" />
          <span>
            Zählt ab <span className="font-semibold text-foreground">{opensAtLabel}</span>
            {remaining && <span className="text-muted-2"> · noch {remaining}</span>}
          </span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            disabled={locked}
            aria-busy={pendingIds.includes(category.id)}
            aria-label={`${category.label} eintragen`}
            onClick={() => handleLog(category.id)}
            className={`relative flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-surface px-2 py-3.5 transition-colors ${
              locked ? 'opacity-60' : 'active:bg-surface-hover'
            } ${pendingIds.includes(category.id) ? 'opacity-60' : ''}`}
          >
            {/* border-2 statt ring/box-shadow: das System verbietet Schatten ausnahmslos. */}
            <span
              className={`absolute -right-1.5 -top-1.5 rounded-full border-2 border-surface px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                locked ? 'bg-white/15 text-foreground' : 'bg-member text-background'
              }`}
            >
              +{category.points}
            </span>
            <span
              className={`flex h-8.5 w-8.5 items-center justify-center rounded-full ${
                locked ? 'bg-white/[0.06] text-muted-1' : 'bg-member/14 text-member'
              }`}
            >
              <PlusIcon className="h-4.5 w-4.5" />
            </span>
            <span
              className={`text-center text-[11px] font-semibold ${
                locked ? 'text-muted-1' : 'text-foreground'
              }`}
            >
              {category.label}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
