import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSessionMember } from '@/lib/auth'
import { BottomNav } from '@/components/ui/BottomNav'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const member = await getSessionMember()
  if (!member) {
    redirect('/join')
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  )
}
