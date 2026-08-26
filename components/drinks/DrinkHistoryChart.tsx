export function DrinkHistoryChart({ days }: { days: Array<{ label: string; count: number }> }) {
  const max = Math.max(1, ...days.map((d) => d.count))

  return (
    <div className="flex items-end gap-2.5" style={{ height: 90 }}>
      {days.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="font-mono text-[10px] text-muted-1">{d.count}</span>
          <div
            className="w-full rounded-t-full bg-accent-lime"
            style={{
              height: Math.max(4, (d.count / max) * 56),
              opacity: d.count === 0 ? 0.12 : 1,
              backgroundColor: d.count === 0 ? 'rgba(255,255,255,0.1)' : undefined,
            }}
          />
          <span className="font-mono text-[9px] text-muted-2">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
