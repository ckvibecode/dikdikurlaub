const COMMENT_THRESHOLDS: Array<{ min: number; comment: string }> = [
  { min: 10, comment: 'Trinkkönig-Alarm! Zeit für ein großes Glas Wasser.' },
  { min: 7, comment: 'Very-Thirsty-Modus aktiviert.' },
  { min: 5, comment: "Lauwarm wird's!" },
  { min: 3, comment: 'Easy Modus!' },
  { min: 1, comment: 'Ruhiger Start heute.' },
  { min: 0, comment: 'Noch nichts getrunken heute.' },
]

export function getDrinkComment(totalToday: number): string {
  return COMMENT_THRESHOLDS.find((t) => totalToday >= t.min)!.comment
}
