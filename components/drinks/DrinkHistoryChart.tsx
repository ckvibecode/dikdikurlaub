export interface DrinkHistoryDay {
  key: string
  /** Wochentagskuerzel fuer die Achse ("Sa"). */
  weekday: string
  /** Datum fuer die Screenreader-Zusammenfassung ("29.08."). */
  dateLabel: string
  count: number
  isToday: boolean
}

const BAR_AREA = 56

export function DrinkHistoryChart({ days }: { days: DrinkHistoryDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.count))
  const summary = days
    .map((d) => `${d.weekday} ${d.dateLabel}${d.isToday ? ' (heute)' : ''}: ${d.count}`)
    .join(', ')

  return (
    <div
      role="img"
      aria-label={`Getränke pro Tag – ${summary}`}
      className="flex items-end gap-2.5"
    >
      {days.map((d) => (
        <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
          <span
            className={`font-mono text-[11px] tabular-nums ${
              d.count === 0 ? 'text-muted-2' : 'text-muted-1'
            }`}
          >
            {d.count}
          </span>
          <div className="flex w-full items-end" style={{ height: BAR_AREA }}>
            {/* Null-Tage bekommen eine sichtbare Grundlinie statt eines Balkens: die alte
                Kombination aus opacity 0.12 UND rgba(255,255,255,0.1) ergab 1,2 % effektive
                Deckkraft — der Balken war buchstaeblich unsichtbar. Die Farbe kommt bewusst
                als Inline-Style aus dem Token statt als bg-Utility: bg-Klassen mit
                Prozent-Opacity werden in diesem Setup nicht zuverlaessig generiert. */}
            <div
              className={`w-full rounded-t-full ${d.count > 0 ? 'bg-member' : ''}`}
              style={{
                height: d.count === 0 ? 3 : Math.max(6, (d.count / max) * BAR_AREA),
                backgroundColor: d.count === 0 ? 'var(--color-muted-3)' : undefined,
              }}
            />
          </div>
          <span
            className={`text-[10px] ${
              d.isToday ? 'font-bold text-foreground' : 'font-semibold text-muted-2'
            }`}
          >
            {d.weekday}
          </span>
        </div>
      ))}
    </div>
  )
}
