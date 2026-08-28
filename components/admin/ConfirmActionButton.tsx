'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import type { ReactNode } from 'react'

/** Wie lange der scharfgeschaltete Button bestätigungsbereit bleibt. */
const ARM_TIMEOUT_MS = 3500

/**
 * Zweistufiger Auslöser für alles, was im Admin-Bereich nicht rückgängig zu machen ist.
 * Übernimmt bewusst das Muster von `DeletePlanItemButton` statt eines Modals: die App wird
 * einhändig bedient, und ein Dialog über dem halben Screen wäre hier genauso im Weg.
 *
 * `action` ist eine bereits gebundene Server Action -- der Aufrufer entscheidet, was passiert.
 */
export function ConfirmActionButton({
  action,
  label,
  confirmLabel = 'Sicher?',
  icon,
  tone = 'danger',
  className = '',
  onDone,
}: {
  action: () => Promise<unknown>
  label: string
  confirmLabel?: string
  icon?: ReactNode
  tone?: 'danger' | 'neutral'
  className?: string
  onDone?: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [armed, setArmed] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearResetTimer() {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current)
      resetTimer.current = null
    }
  }

  useEffect(() => clearResetTimer, [])

  function handleClick() {
    if (!armed) {
      setFailed(null)
      setArmed(true)
      resetTimer.current = setTimeout(() => setArmed(false), ARM_TIMEOUT_MS)
      return
    }

    clearResetTimer()
    setArmed(false)
    startTransition(async () => {
      try {
        await action()
        onDone?.()
      } catch (err) {
        // Die Server Actions werfen mit Klartext-Meldungen (z.B. "Der Trip braucht
        // mindestens einen Admin"). Ohne diesen Zweig verpufft das im Nichts.
        setFailed(err instanceof Error ? err.message : 'Das hat nicht geklappt')
      }
    })
  }

  const armedClasses =
    tone === 'danger'
      ? 'border-danger/45 bg-danger/12 text-danger'
      : 'border-member/45 bg-member/12 text-member'

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        aria-label={armed ? `${label} – ${confirmLabel}` : label}
        className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${
          armed
            ? armedClasses
            : 'border-white/10 bg-white/[0.04] text-muted-1 hover:bg-white/[0.08] hover:text-foreground'
        } ${className}`}
      >
        {icon}
        <span>{pending ? '…' : armed ? confirmLabel : label}</span>
      </button>
      {failed && <span className="text-[11px] text-danger">{failed}</span>}
    </span>
  )
}
