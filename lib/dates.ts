import { formatInTimeZone } from 'date-fns-tz'

export const TRIP_TZ = 'Europe/Berlin'

/** Trip-lokaler Kalendertag als 'YYYY-MM-DD', für Streak-/Tages-Gruppierungen. */
export function getTripDayKey(date: Date = new Date(), timezone: string = TRIP_TZ): string {
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd')
}

/** Anzahl ganzer Kalendertage zwischen zwei Day-Keys (b - a). */
export function dayKeyDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const aUtc = Date.UTC(ay, am - 1, ad)
  const bUtc = Date.UTC(by, bm - 1, bd)
  return Math.round((bUtc - aUtc) / (1000 * 60 * 60 * 24))
}
