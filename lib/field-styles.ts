const BASE =
  'rounded-xl border bg-white/[0.04] px-4 py-3 text-base outline-none transition-colors'

export function inputClass(hasError: boolean): string {
  return hasError
    ? `${BASE} border-danger/70 focus:border-danger`
    : `${BASE} border-white/10 focus:border-member/60`
}

/**
 * Kompaktes Eingabefeld fuer die dichten Verwaltungslisten. Bewusst ohne Breitenangabe:
 * die Felder stehen mal allein, mal zu dritt in einer Zeile, und eine mitgelieferte
 * `w-full` liesse sich am Aufrufort nicht zuverlaessig ueberschreiben. Eigene Konstante statt
 * `inputClass`, weil die Auth-Screens bewusst grosszuegiger gesetzt sind (16px Schrift gegen
 * den iOS-Zoom beim Fokus) -- im Admin-Bereich zaehlt dagegen, viel auf einen Screen zu bekommen.
 */
export const ADMIN_FIELD =
  'rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none transition-colors focus:border-member/60'

/** Beschriftung ueber einem kompakten Feld. */
export const ADMIN_LABEL = 'mb-1 block text-[11px] font-medium text-muted-2'
