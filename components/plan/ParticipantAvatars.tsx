import { getAvatarHex } from '@/lib/avatar'

export interface Participant {
  id: string
  name: string
  avatar: string
}

const MAX_VISIBLE = 5

export function ParticipantAvatars({ participants }: { participants: Participant[] }) {
  if (participants.length === 0) {
    return <span className="text-[11px] text-muted-2">Noch niemand dabei</span>
  }

  const visible = participants.slice(0, MAX_VISIBLE)
  const overflow = participants.length - visible.length

  return (
    <div className="flex min-w-0 items-center">
      <div className="flex shrink-0 -space-x-2">
        {visible.map((p) => {
          const hex = getAvatarHex(p.avatar)
          return (
            <div
              key={p.id}
              title={p.name}
              className="flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 border-background"
              style={{ backgroundColor: hex }}
            >
              <span className="text-[10px] font-bold text-background">{p.name.charAt(0).toUpperCase()}</span>
            </div>
          )
        })}
        {overflow > 0 && (
          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 border-background bg-white/10">
            <span className="font-mono text-[11px] font-bold tabular-nums text-muted-1">+{overflow}</span>
          </div>
        )}
      </div>
      {/* Die Anzahl ist ein Count: Mono mit tabular-nums (Scoreboard-Regel), das Wort
          daneben bleibt Prosa. Beides im Label-Schritt, es ist eine Metadaten-Angabe. */}
      <span className="ml-2.5 whitespace-nowrap text-[11px] text-muted-2">
        <span className="font-mono tabular-nums">{participants.length}</span> dabei
      </span>
    </div>
  )
}
