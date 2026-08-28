import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminMember } from '@/lib/admin'
import { AdminNav } from '@/components/admin/AdminNav'
import { ArrowLeftIcon } from '@/components/icons'

/**
 * Gate für den gesamten Admin-Bereich.
 *
 * Bewusst `notFound()` und nicht "kein Zugriff": eine Verbotsmeldung würde bestätigen, dass
 * es die Route überhaupt gibt. Wer nicht Admin ist, soll den Bereich nicht einmal erahnen --
 * für ihn existiert `/admin` schlicht nicht.
 *
 * Das ist nur die erste von drei Schichten: `proxy.ts` fängt Nicht-Eingeloggte ab, und jede
 * Server Action prüft die Rolle noch einmal selbst, weil Actions per POST direkt aufrufbar
 * sind und ein Layout dagegen nichts ausrichtet.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminMember()
  if (!admin) notFound()

  return (
    <div className="flex flex-col gap-4 px-4.5 pb-6 pt-5.5">
      <div className="animate-rise-in flex items-center gap-3">
        <Link
          href="/home"
          aria-label="Zurück zur App"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-muted-1 transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-foreground">Verwaltung</h1>
          <p className="mt-0.5 truncate text-sm text-muted-1">{admin.trip.name}</p>
        </div>
      </div>

      <div className="animate-rise-in" style={{ animationDelay: '70ms' }}>
        <AdminNav />
      </div>

      {children}
    </div>
  )
}
