'use client'

import { useState, type ReactNode } from 'react'

/**
 * Klappt die bereits vergangenen Reisetage weg. Der Screen beantwortet damit als Erstes die
 * Frage, fuer die man ihn oeffnet ("was kommt jetzt?"), statt immer bei Tag 1 zu beginnen —
 * ein Auto-Scroll wird dadurch ueberfluessig.
 */
export function PastDaysDisclosure({ count, children }: { count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-muted-1 transition-colors hover:border-member/40 hover:text-member"
      >
        {open
          ? 'Vergangene Tage ausblenden'
          : `${count} ${count === 1 ? 'Tag' : 'Tage'} vorbei · anzeigen`}
      </button>
      {open && children}
    </div>
  )
}
