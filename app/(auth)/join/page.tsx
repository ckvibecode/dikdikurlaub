import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { JoinForm } from '@/components/auth/JoinForm'
import { AuthBrand } from '@/components/auth/AuthBrand'

/**
 * Die Seite nutzt sonst keine dynamische API (kein cookies()/headers()) und wuerde
 * deshalb beim Build vorgerendert. Die Liste der schon vergebenen Farben waere dann
 * auf dem Stand des letzten Deploys eingefroren: neue Mitglieder saehen weiterhin
 * belegte Farben und wuerden beim Absenden abgewiesen. Erzwungen dynamisch, damit
 * wirklich nur die aktuell freien Farben zur Auswahl stehen.
 */
export const dynamic = 'force-dynamic'

export default async function JoinPage() {
  const trip = await prisma.trip.findFirst({ select: { members: { select: { avatar: true } } } })
  const takenAvatars = trip?.members.map((m) => m.avatar) ?? []

  return (
    <Card className="flex flex-col gap-6 p-5">
      <AuthBrand />
      <div className="animate-rise-in" style={{ animationDelay: '90ms' }}>
        <h1 className="text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
          Trip beitreten
        </h1>
        <p className="mt-2 text-sm leading-snug text-muted-1">
          Trip-Code von der Gruppe holen, Namen und PIN wählen &ndash; los geht&apos;s.
        </p>
      </div>
      <div className="animate-rise-in" style={{ animationDelay: '170ms' }}>
        <JoinForm takenAvatars={takenAvatars} />
      </div>
      <p className="text-center text-sm text-muted-1">
        Schon dabei?{' '}
        <Link href="/login" className="font-semibold text-accent-lime">
          Einloggen
        </Link>
      </p>
    </Card>
  )
}
