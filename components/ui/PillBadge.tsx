import type { ReactNode } from 'react'

const TONE_CLASSES = {
  member: 'bg-member/14 border-member/45 text-member',
  lime: 'bg-accent-lime/12 border-accent-lime/40 text-accent-lime',
  danger: 'bg-danger/12 border-danger/40 text-danger',
  neutral: 'bg-white/[0.06] border-white/10 text-muted-1',
} as const

const ROTATE_CLASSES = {
  none: '',
  left: '-rotate-6',
  right: 'rotate-3',
} as const

export function PillBadge({
  children,
  tone = 'member',
  rotate = 'none',
  className = '',
}: {
  children: ReactNode
  tone?: keyof typeof TONE_CLASSES
  rotate?: keyof typeof ROTATE_CLASSES
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]} ${ROTATE_CLASSES[rotate]} ${className}`}
    >
      {children}
    </span>
  )
}
