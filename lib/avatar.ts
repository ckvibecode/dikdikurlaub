/**
 * Profilfarben. Der Schluessel (z. B. `violet`) landet so in der DB — Schluessel
 * deshalb nie umbenennen, sonst verlieren bestehende Mitglieder ihre Farbe.
 *
 * Alle Werte sind hell genug, damit die dunkle Schrift auf dem Avatar-Kreis
 * (`text-background`) lesbar bleibt (mind. 4.5:1 gegen #0a0c10). Die Palette
 * mischt bewusst drei Helligkeitsstufen pro Farbfamilie (kraeftig / pastell /
 * dunkel), weil sich 25 Farben ueber den Farbton allein nicht mehr sauber
 * unterscheiden lassen.
 */
export const AVATAR_HEX: Record<string, string> = {
  lime: '#c8ff4d',

  red: '#ff6161',
  crimson: '#e8394f',
  rose: '#ffb0b0',
  orange: '#ff9f4d',
  rust: '#e07b28',
  peach: '#ffcaa3',
  gold: '#ffcf3d',
  butter: '#ffeaa3',
  grass: '#74d94d',
  sage: '#bdeeb0',
  mint: '#4dffa0',
  emerald: '#1fc79c',
  teal: '#4de6c8',
  ice: '#a6ece2',
  cyan: '#3ddcff',
  blue: '#4ea8ff',
  ocean: '#2f86e0',
  sky: '#a5d3ff',
  violet: '#7a6ff0',
  lavender: '#c5b8ff',
  purple: '#c86fff',
  plum: '#a95ce0',
  magenta: '#ff4dd6',
  pink: '#ff6fb0',
  blush: '#ffc2dd',
}

export const AVATAR_LABELS: Record<string, string> = {
  lime: 'Limette',

  red: 'Rot',
  crimson: 'Karmin',
  rose: 'Rosé',
  orange: 'Orange',
  rust: 'Rost',
  peach: 'Pfirsich',
  gold: 'Gold',
  butter: 'Butter',
  grass: 'Grasgrün',
  sage: 'Salbei',
  mint: 'Mint',
  emerald: 'Smaragd',
  teal: 'Türkis',
  ice: 'Eisblau',
  cyan: 'Cyan',
  blue: 'Blau',
  ocean: 'Ozean',
  sky: 'Himmelblau',
  violet: 'Violett',
  lavender: 'Lavendel',
  purple: 'Lila',
  plum: 'Pflaume',
  magenta: 'Magenta',
  pink: 'Pink',
  blush: 'Zartrosa',
}

export function getAvatarHex(avatar: string): string {
  return AVATAR_HEX[avatar] ?? AVATAR_HEX.lime
}
