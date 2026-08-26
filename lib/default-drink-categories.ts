/**
 * Punkte orientiert an der ungefähren reinen Alkoholmenge einer üblichen Portion (nicht am
 * Alkoholgehalt allein) -- ein Bier hat trotz niedrigerem Prozentwert insgesamt mehr Alkohol als
 * ein einzelner Shot in seinem kleinen Glas:
 *
 * - Shot   ~2cl, ~38% Vol.  -> ~7-8ml reiner Alkohol   -> 1 Punkt
 * - Bier   ~330ml, ~5% Vol. -> ~16-17ml reiner Alkohol -> 2 Punkte
 * - Wein   ~150ml, ~12% Vol.-> ~18ml reiner Alkohol    -> 2 Punkte
 * - Cocktail ~200ml, ~15% Vol. (mehrere Spirituosen)   -> ~28-30ml reiner Alkohol -> 3 Punkte
 */
export const DEFAULT_DRINK_CATEGORIES: Array<{ label: string; points: number; sortOrder: number }> = [
  { label: 'Bier', points: 2, sortOrder: 0 },
  { label: 'Shot', points: 1, sortOrder: 1 },
  { label: 'Cocktail', points: 3, sortOrder: 2 },
  { label: 'Wein', points: 2, sortOrder: 3 },
]
