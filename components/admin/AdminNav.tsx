'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/admin', label: 'Übersicht' },
  { href: '/admin/members', label: 'Personen' },
  { href: '/admin/plan', label: 'Plan' },
  { href: '/admin/drinks', label: 'Getränke' },
  { href: '/admin/penalties', label: 'Strafen' },
  { href: '/admin/ledger', label: 'Punkte' },
] as const

export function AdminNav() {
  const pathname = usePathname()

  return (
    // Horizontal scrollbar statt Umbruch: sechs Reiter passen auf keinem Telefon in eine
    // Zeile, und ein zweizeiliger Reiter-Block würde den halben Screen fressen.
    <nav aria-label="Admin-Bereiche" className="-mx-4.5 overflow-x-auto px-4.5">
      <div className="flex w-max gap-1.5">
        {ITEMS.map(({ href, label }) => {
          // '/admin' ist Präfix aller anderen Routen und darf deshalb nur exakt matchen.
          const active = href === '/admin' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-9 items-center rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                active
                  ? 'border-member/45 bg-member/14 text-member'
                  : 'border-white/10 bg-white/[0.04] text-muted-1'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
