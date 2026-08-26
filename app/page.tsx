import { redirect } from 'next/navigation'
import { getSessionMember } from '@/lib/auth'

export default async function RootPage() {
  const member = await getSessionMember()
  redirect(member ? '/home' : '/join')
}
