/**
 * Ehrentitel der Rangliste. Beide sind fuer alle sichtbar -- der Witz lebt davon, dass die
 * Gruppe sie sieht, nicht nur der Betroffene.
 *
 * Bewusst ohne `server-only`: Home-Screen und Rangliste sollen dieselbe Regel benutzen,
 * und die Titel sind reine Anzeigelogik ohne DB-Zugriff.
 */

export const TITLE_FIRST = 'Bierkules'
export const TITLE_LAST = 'Schwachstelle'

export interface RankedMember {
  id: string
  points: number
}

export interface RankTitles {
  /** Erstplatzierter, oder null wenn es keinen eindeutigen gibt. */
  firstId: string | null
  /** Letztplatzierter, oder null wenn es keinen eindeutigen gibt. */
  lastId: string | null
}

/**
 * Ermittelt, wer die Titel bekommt. Die Reihenfolge der Liste ist egal, gezaehlt werden nur
 * Punkte.
 *
 * Bei Gleichstand vergibt die Funktion den jeweiligen Titel gar nicht -- dieselbe Regel, nach
 * der die Rangliste schon heute niemanden zum Ersten kroent, wenn zwei gleichauf liegen.
 * Sonst wuerde die Sortierreihenfolge jemanden willkuerlich auszeichnen oder blossstellen.
 */
export function getRankTitles(members: RankedMember[]): RankTitles {
  if (members.length === 0) return { firstId: null, lastId: null }

  const top = Math.max(...members.map((m) => m.points))
  const bottom = Math.min(...members.map((m) => m.points))

  const atTop = members.filter((m) => m.points === top)
  const atBottom = members.filter((m) => m.points === bottom)

  // Solange noch niemand gepunktet hat, gibt es keinen Bierkules: eine Null als Bestleistung
  // auszuzeichnen waere albern.
  const firstId = atTop.length === 1 && top > 0 ? atTop[0].id : null

  // Ein einzelnes Mitglied ist nicht gleichzeitig Erster und Letzter.
  const lastId =
    members.length >= 2 && atBottom.length === 1 && atBottom[0].id !== firstId
      ? atBottom[0].id
      : null

  return { firstId, lastId }
}
