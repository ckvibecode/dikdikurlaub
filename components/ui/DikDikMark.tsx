export function DikDikMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Hoerner: beim Dik-Dik kurz und leicht gespreizt */}
      <path d="M20 16.5 18.2 9" />
      <path d="M28 16.5 29.8 9" />
      {/* Ohren: die uebergrossen Loeffel sind das Erkennungsmerkmal */}
      <path d="M18 20c-7-5-12-6-15-3 1 5 7 8 14 7" />
      <path d="M30 20c7-5 12-6 15-3-1 5-7 8-14 7" />
      {/* Kopf mit gerundeter Schnauze */}
      <path d="M18 18c-2 8-1 13.5 3 17 1 .9 2 1.4 3 1.4s2-.5 3-1.4c4-3.5 5-9 3-17z" />
      {/* Augen */}
      <circle cx="20.6" cy="25" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="27.4" cy="25" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}
