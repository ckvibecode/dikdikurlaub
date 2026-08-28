'use client'

import { useOptimistic, useState, useTransition, type CSSProperties } from 'react'
import { toggleParticipation } from '@/lib/actions/plan-actions'
import { CheckIcon } from '@/components/icons'
import { StatNumber } from '@/components/ui/StatNumber'

/** Nur fuer Screenreader. Bewusst inline und nicht als `sr-only`: die Utility kommt im
 *  Projekt sonst nirgends vor und wird daher nicht zuverlaessig generiert. */
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

export function PlanItemParticipation({
  planItemId,
  joined,
  points,
  itemTitle,
}: {
  planItemId: string
  joined: boolean
  points: number
  /** Ohne den Titel heissen auf einer Seite alle Toggles gleich und sind im
   *  Screenreader nicht auseinanderzuhalten. */
  itemTitle: string
}) {
  const [pending, startTransition] = useTransition()
  const [optimisticJoined, setOptimisticJoined] = useOptimistic(joined)
  // Bleibt leer bis zum ersten Tap: eine von Anfang an gefuellte Live-Region wuerde beim
  // Laden einmal pro Karte vorgelesen.
  const [announcement, setAnnouncement] = useState('')

  const hasPoints = points > 0

  function handleToggle() {
    // Kein `disabled` waehrend des Requests: das raeumt den Fokus auf <body> ab. Doppeltipps
    // werden stattdessen hier verworfen.
    if (pending) return
    const next = !optimisticJoined

    setAnnouncement(
      next
        ? hasPoints
          ? `Du bist bei ${itemTitle} dabei. ${points} Punkte kassiert.`
          : `Du bist bei ${itemTitle} dabei.`
        : hasPoints
          ? `Du bist bei ${itemTitle} nicht mehr dabei. ${points} Punkte zurückgenommen.`
          : `Du bist bei ${itemTitle} nicht mehr dabei.`,
    )

    startTransition(async () => {
      setOptimisticJoined(next)
      await toggleParticipation(planItemId)
    })
  }

  // One-Loud-Color: genau ein Element traegt das Signal. Gibt es Punkte, uebernimmt der Pill
  // die Bestaetigung, sobald man dabei ist — dann faellt der Button auf Ghost zurueck. Ohne
  // Punkte existiert kein Pill, also bleibt der Button selbst das laute Element.
  const loudButton = optimisticJoined && !hasPoints

  return (
    <div className="ml-auto flex shrink-0 items-center gap-2">
      {hasPoints && (
        <span
          // Der Key erzwingt ein Remount, damit der Auftritt beim Wechsel genau einmal laeuft.
          key={optimisticJoined ? 'kassiert' : 'offen'}
          className={`inline-flex items-center gap-1 border px-2.5 py-1 ${
            optimisticJoined
              ? 'bloom rounded-blob rotate-3 animate-rise-in border-member/45 bg-member/14 text-member'
              : 'rounded-full border-accent-lime/40 bg-accent-lime/12 text-accent-lime'
          }`}
        >
          <StatNumber size="sm">+{points}</StatNumber>
          {/* Chip-Text gehoert in den Label-Schritt (9-11px), die Zahl in den Stat-Schritt. */}
          <span className="text-[11px] font-semibold">{optimisticJoined ? 'kassiert' : 'Pkt'}</span>
        </span>
      )}

      <button
        type="button"
        aria-busy={pending}
        aria-pressed={optimisticJoined}
        aria-label={`Dabei bei ${itemTitle}`}
        onClick={handleToggle}
        className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
          pending ? 'opacity-60' : ''
        } ${
          loudButton
            ? 'bg-member text-background'
            : optimisticJoined
              ? 'bg-white/[0.06] text-foreground'
              : 'border border-white/15 bg-transparent text-muted-1 hover:border-member/50 hover:text-member'
        }`}
      >
        {optimisticJoined && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
        {optimisticJoined ? 'Dabei' : 'Bin dabei?'}
      </button>

      <span role="status" style={VISUALLY_HIDDEN}>
        {announcement}
      </span>
    </div>
  )
}
