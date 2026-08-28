/**
 * Grenzwerte des Admin-Bereichs. Bewusst ohne `server-only`: die Client-Formulare lesen
 * dieselben Werte fuer ihre min/max-Attribute, damit UI und Action nicht auseinanderlaufen.
 */

/** Obergrenze fuer eine einzelne manuelle Punktekorrektur -- verhindert Vertipper wie 5000. */
export const MAX_ADMIN_POINT_ADJUSTMENT = 500

/** Obergrenze fuer die Menge eines einzelnen Getraenke-Eintrags. */
export const MAX_DRINK_QUANTITY = 20

/** Wie viele Eintraege die Verwaltungslisten hoechstens laden. */
export const ADMIN_LIST_LIMIT = 100
