import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { JoinForm } from '@/components/auth/JoinForm'

export default async function JoinPage() {
  const trip = await prisma.trip.findFirst({ select: { members: { select: { avatar: true } } } })
  const takenAvatars = trip?.members.map((m) => m.avatar) ?? []

  return (
    <Card className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Trip beitreten</h1>
        <p className="mt-1 text-sm text-muted-1">
          Trip-Code von der Gruppe holen, Namen und PIN wählen &ndash; los geht&apos;s.
        </p>
      </div>
      <JoinForm takenAvatars={takenAvatars} />
      <p className="text-center text-sm text-muted-2">
        Schon dabei?{' '}
        <Link href="/login" className="font-semibold text-accent-lime">
          Einloggen
        </Link>
      </p>
    </Card>
  )
}
