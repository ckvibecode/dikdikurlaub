const POSITION_CLASSES = {
  'top-right': '-top-16 -right-14',
  'bottom-left': 'bottom-10 -left-16',
} as const

const COLOR_CLASSES = {
  lime: 'bg-accent-lime',
  violet: 'bg-accent-violet',
} as const

export function GlowBlob({
  position,
  color,
  size = 220,
}: {
  position: keyof typeof POSITION_CLASSES
  color: keyof typeof COLOR_CLASSES
  size?: number
}) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full opacity-[0.16] blur-[55px] ${POSITION_CLASSES[position]} ${COLOR_CLASSES[color]}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  )
}
