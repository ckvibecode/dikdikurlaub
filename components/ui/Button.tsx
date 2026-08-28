import type { ButtonHTMLAttributes } from 'react'

const VARIANT_CLASSES = {
  primary: 'bg-member text-background hover:bg-member/90',
  secondary: 'bg-transparent border border-member/50 text-member hover:bg-member/10',
  ghost: 'bg-white/[0.06] text-foreground hover:bg-white/[0.1]',
} as const

export function Button({
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANT_CLASSES }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none min-h-11 ${VARIANT_CLASSES[variant]} ${className}`}
      disabled={disabled}
      {...props}
    />
  )
}
