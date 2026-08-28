import type { CSSProperties, ReactNode } from 'react'

export function Card({
  children,
  variant = 'default',
  className = '',
  style,
}: {
  children: ReactNode
  variant?: 'default' | 'blob'
  className?: string
  style?: CSSProperties
}) {
  const radius = variant === 'blob' ? 'rounded-blob' : 'rounded-2xl'
  return (
    <div
      className={`relative bg-surface border border-white/[0.06] ${radius} p-4 ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
