import type { CSSProperties, ReactNode } from 'react'

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
  xl: 'text-[28px]',
} as const

export function StatNumber({
  children,
  size = 'md',
  className = '',
  style,
}: {
  children: ReactNode
  size?: keyof typeof SIZE_CLASSES
  className?: string
  style?: CSSProperties
}) {
  return (
    <span className={`font-mono tabular-nums font-semibold ${SIZE_CLASSES[size]} ${className}`} style={style}>
      {children}
    </span>
  )
}
