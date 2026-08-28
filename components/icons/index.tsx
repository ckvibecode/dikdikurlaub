import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  // Die Icons sind durchgaengig dekorativ: jedes sitzt neben einem Textlabel oder in
  // einem Button, der seinen eigenen Namen traegt.
  'aria-hidden': true,
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10.5 10 4l7 6.5" />
      <path d="M5 9v7a1 1 0 0 0 1 1h3v-4h2v4h3a1 1 0 0 0 1-1V9" />
    </svg>
  )
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M6 5H3a2 2 0 0 0 2 4" />
      <path d="M14 5h3a2 2 0 0 1-2 4" />
      <path d="M10 12v3" />
      <path d="M7 18h6" />
    </svg>
  )
}

export function CupIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3h8l-1 12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2L6 3Z" />
      <path d="M5 3h10" />
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14" />
    </svg>
  )
}

export function WarningIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 2.5 2 17h16L10 2.5Z" />
      <path d="M10 8v4" />
    </svg>
  )
}

export function FlameIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...props}>
      <path d="M10 2.5c1.2 3-2.8 4.2-2.8 7.2a2.8 2.8 0 0 0 5.6 0c0-1-.4-1.8-.9-1.9.4 1.8-1 2.6-1.8.9-.6-1.2 0-2.7 0-2.7-1.9 1-2.9 2.9-2.9 4.6a3.9 3.9 0 0 0 7.8 0c0-3.7-2.8-4.8-5-8.1Z" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10.5 8 15l8-10" />
    </svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 8.5V6a3.5 3.5 0 1 1 7 0v2.5" />
      <rect x="4.5" y="8.5" width="11" height="7.5" rx="2.2" />
      <path d="M10 11.5v2" />
    </svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6h12" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6" />
      <path d="M5.5 6 6 16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l.5-10" />
      <path d="M8.5 9v5M11.5 9v5" />
    </svg>
  )
}

export function GearIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.6l1 2.1 2.3-.5.6 2.3 2.1 1-1.2 2 1.2 2-2.1 1-.6 2.3-2.3-.5-1 2.1-1-2.1-2.3.5-.6-2.3-2.1-1 1.2-2-1.2-2 2.1-1 .6-2.3 2.3.5 1-2.1Z" />
    </svg>
  )
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M16 10H4" />
      <path d="M9 5l-5 5 5 5" />
    </svg>
  )
}

export function PencilIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13.2 3.6a1.9 1.9 0 0 1 2.7 2.7L7.4 14.8 4 16l1.2-3.4 8-9Z" />
    </svg>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="7" r="2.8" />
      <path d="M3 16.5c0-2.5 2.2-4.2 5-4.2s5 1.7 5 4.2" />
      <path d="M13.5 5.2a2.6 2.6 0 0 1 0 5.1" />
      <path d="M15 12.6c1.4.6 2.3 1.9 2.3 3.6" />
    </svg>
  )
}

export function ListIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 5.5h10M7 10h10M7 14.5h10" />
      <path d="M3.6 5.5h.01M3.6 10h.01M3.6 14.5h.01" />
    </svg>
  )
}
