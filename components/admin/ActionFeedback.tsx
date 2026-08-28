import type { ActionState } from '@/lib/actions/admin-actions'

/** Einheitliche Rückmeldung unter den Verwaltungs-Formularen. `aria-live`, weil die Meldung
 * nach dem Absenden erscheint, ohne dass der Fokus sie erreicht. */
export function ActionFeedback({ state }: { state: ActionState }) {
  if (!state.error && !state.success) return null

  return (
    <p
      aria-live="polite"
      className={`text-xs font-medium ${state.error ? 'text-danger' : 'text-member'}`}
    >
      {state.error ?? state.success}
    </p>
  )
}
