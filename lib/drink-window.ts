import { fromZonedTime } from 'date-fns-tz'
import { TRIP_TZ, getTripDayKey } from '@/lib/dates'

/**
 * Getraenke lassen sich erst ab dieser Stunde (trip-lokal) eintragen. Davor soll die App
 * Alkohol am Tag nicht mit Punkten belohnen.
 */
export const DRINK_TRACKING_START_HOUR = 18

export interface DrinkWindow {
  open: boolean
  /**
   * Absoluter Zeitpunkt, ab dem heute geloggt werden darf. Bewusst ein echter Instant und
   * keine Uhrzeit-Zeichenkette: der Client rechnet damit korrekt, egal in welcher Zeitzone
   * sein Geraet steht.
   */
  opensAt: Date
}

export function getDrinkWindow(now: Date = new Date()): DrinkWindow {
  const hour = String(DRINK_TRACKING_START_HOUR).padStart(2, '0')
  const opensAt = fromZonedTime(`${getTripDayKey(now)} ${hour}:00:00`, TRIP_TZ)
  return { open: now.getTime() >= opensAt.getTime(), opensAt }
}
