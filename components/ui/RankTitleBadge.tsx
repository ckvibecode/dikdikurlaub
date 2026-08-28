import { TITLE_FIRST, TITLE_LAST } from '@/lib/titles'

/**
 * Die beiden Ranglisten-Titel. Eigene Klassen statt `PillBadge`, weil die Titel in den engen
 * Ranglisten-Zeilen kleiner sitzen muessen als ein normales Badge -- und Groessen-Utilities
 * eines fremden Bausteins lassen sich von aussen nicht zuverlaessig ueberschreiben.
 *
 * Lime fuer Platz 1 folgt der Systemfarbe (siehe `AVATAR_COLORS` in lib/validations.ts);
 * der Trostpreis bleibt bewusst grau statt rot: rot laese sich wie ein Fehler.
 */
const VARIANTS = {
  first: {
    label: TITLE_FIRST,
    className: 'border-accent-lime/40 bg-accent-lime/12 text-accent-lime rotate-3',
  },
  last: {
    label: TITLE_LAST,
    className: 'border-white/10 bg-white/[0.06] text-muted-1',
  },
} as const

export function RankTitleBadge({ variant }: { variant: keyof typeof VARIANTS }) {
  const { label, className } = VARIANTS[variant]
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${className}`}
    >
      {label}
    </span>
  )
}
