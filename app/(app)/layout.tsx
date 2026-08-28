import type { CSSProperties, ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSessionMember } from '@/lib/auth'
import { getAvatarHex } from '@/lib/avatar'
import { BottomNav } from '@/components/ui/BottomNav'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const member = await getSessionMember()
  if (!member) {
    redirect('/join')
  }

  // Die gewaehlte Profilfarbe traegt das gesamte Farbschema der App. Alles darunter
  // liest sie ueber die Tailwind-Farbe `member` (siehe globals.css).
  const memberTheme = { '--member': getAvatarHex(member.avatar) } as CSSProperties

  return (
    <div className="flex min-h-full flex-1 flex-col" style={memberTheme}>
      <main aria-label="Inhalt" className="mx-auto w-full max-w-md flex-1 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
