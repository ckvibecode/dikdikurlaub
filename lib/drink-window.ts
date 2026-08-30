import { fromZonedTime } from 'date-fns-tz'
import { TRIP_TZ, getTripDayKey, shiftDayKey } from '@/lib/dates'

/**
 * Getraenke lassen sich nur abends bis nachts eintragen: ab dieser Stunde (trip-lokal) bis
 * DRINK_TRACKING_END_HOUR am Folgemorgen. Alkohol am Tag soll die App nicht mit Punkten belohnen.
 */
export const DRINK_TRACKING_START_HOUR = 18
/** Ende des Fensters am Folgetag: die Nacht laeuft ueber Mitternacht hinweg weiter. */
export const DRINK_TRACKING_END_HOUR = 6

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

/** Feste Uhrzeit-Labels fuer Texte, die keinen Instant zur Hand haben (z.B. Fehlermeldungen). */
export const DRINK_TRACKING_START_LABEL = hourLabel(DRINK_TRACKING_START_HOUR)
export const DRINK_TRACKING_END_LABEL = hourLabel(DRINK_TRACKING_END_HOUR)

export interface DrinkWindow {
  open: boolean
  /**
   * Absoluter Zeitpunkt, ab dem das laufende bzw. naechste Fenster zaehlt. Bewusst ein echter
   * Instant und keine Uhrzeit-Zeichenkette: der Client rechnet damit korrekt, egal in welcher
   * Zeitzone sein Geraet steht.
   */
  opensAt: Date
  /** Ende desselben Fensters, immer am Kalendertag nach `opensAt`. */
  closesAt: Date
}

function tripInstant(dayKey: string, hour: number): Date {
  return fromZonedTime(`${dayKey} ${hourLabel(hour)}:00`, TRIP_TZ)
}

export function getDrinkWindow(now: Date = new Date()): DrinkWindow {
  const today = getTripDayKey(now)
  const endsThisMorning = tripInstant(today, DRINK_TRACKING_END_HOUR)

  // Vor 06:00 laeuft noch die Nacht, die gestern Abend begonnen hat.
  if (now.getTime() < endsThisMorning.getTime()) {
    return {
      open: true,
      opensAt: tripInstant(shiftDayKey(today, -1), DRINK_TRACKING_START_HOUR),
      closesAt: endsThisMorning,
    }
  }

  // Sonst gilt das Fenster von heute Abend bis morgen frueh - tagsueber als naechstes,
  // ab 18:00 als laufendes.
  const opensAt = tripInstant(today, DRINK_TRACKING_START_HOUR)
  const closesAt = tripInstant(shiftDayKey(today, 1), DRINK_TRACKING_END_HOUR)
  return { open: now.getTime() >= opensAt.getTime(), opensAt, closesAt }
}
