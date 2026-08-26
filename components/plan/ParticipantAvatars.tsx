import { getAvatarHex } from '@/lib/avatar'

export interface Participant {
  id: string
  name: string
  avatar: string
}

const MAX_VISIBLE = 5

export function ParticipantAvatars({ participants }: { participants: Participant[] }) {
  if (participants.length === 0) {
    return <span className="text-xs text-muted-2">Noch niemand dabei</span>
  }

  const visible = participants.slice(0, MAX_VISIBLE)
  const overflow = participants.length - visible.length

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((p) => {
          const hex = getAvatarHex(p.avatar)
          return (
            <div
              key={p.id}
              title={p.name}
              className="flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 border-background"
              style={{ backgroundColor: hex }}
            >
              <span className="font-mono text-[10px] font-bold text-background">{p.name.charAt(0).toUpperCase()}</span>
            </div>
          )
        })}
        {overflow > 0 && (
          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 border-background bg-white/10">
            <span className="font-mono text-[9px] font-bold text-muted-1">+{overflow}</span>
          </div>
        )}
      </div>
      <span className="ml-2.5 text-xs text-muted-2">{participants.length} dabei</span>
    </div>
  )
}
