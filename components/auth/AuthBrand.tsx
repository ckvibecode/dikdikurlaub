import { DikDikMark } from '@/components/ui/DikDikMark'

export function AuthBrand() {
  return (
    <div className="flex items-center gap-3">
      <span className="mark-well animate-mark-perk flex h-11 w-11 shrink-0 items-center justify-center rounded-blob bg-accent-lime/[0.14]">
        <DikDikMark className="h-6 w-6 rotate-6 text-accent-lime" />
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-1">
        DikDik auf Reisen
      </span>
    </div>
  )
}
