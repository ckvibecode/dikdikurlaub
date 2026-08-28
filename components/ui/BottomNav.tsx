'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, TrophyIcon, CupIcon, CalendarIcon, WarningIcon } from '@/components/icons'

const ITEMS = [
  { href: '/home', label: 'Home', Icon: HomeIcon },
  { href: '/leaderboard', label: 'Rang', Icon: TrophyIcon },
  { href: '/drinks', label: 'Drinks', Icon: CupIcon },
  { href: '/plan', label: 'Plan', Icon: CalendarIcon },
  { href: '/strafen', label: 'Strafen', Icon: WarningIcon },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-10 mx-auto flex w-full max-w-md items-center justify-around border-t border-white/[0.06] bg-[#0e1015] px-2 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 px-2 py-1"
          >
            <span
              className={`flex h-7 w-8 items-center justify-center rounded-full ${
                active ? 'bg-member/16 text-member' : 'text-muted-3'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className={`text-[11px] font-semibold ${active ? 'text-member' : 'text-muted-2'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
