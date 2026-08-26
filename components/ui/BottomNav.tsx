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
    <nav className="sticky bottom-0 z-10 flex items-center justify-around border-t border-white/[0.06] bg-[#0e1015] px-2 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className="flex min-w-11 flex-col items-center gap-1.5 px-2 py-1"
          >
            <span
              className={`flex h-8.5 w-9 items-center justify-center rounded-[45%_55%_60%_40%/60%_40%_60%_40%] ${
                active ? 'bg-accent-lime/14 text-accent-lime' : 'text-muted-3'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className={`text-[10px] font-medium ${active ? 'text-accent-lime' : 'text-muted-3'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
