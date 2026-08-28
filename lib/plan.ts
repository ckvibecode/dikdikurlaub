/**
 * Obergrenze fuer Punkte, die ein Programmpunkt bei Teilnahme vergeben darf. Bewusst niedrig:
 * der Tagesplan soll die Rangliste wuerzen, nicht entscheiden.
 *
 * Liegt ausserhalb von `lib/actions/plan-actions.ts`, weil eine 'use server'-Datei
 * ausschliesslich async-Funktionen exportieren darf.
 */
export const MAX_PLAN_ITEM_POINTS = 5
